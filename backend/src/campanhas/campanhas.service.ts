import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetaAdsClient } from '../integracoes/meta-ads/meta-ads.client';
import { CofreService } from '../common/cofre/cofre.service';
import { MetricasService } from '../metricas/metricas.service';

/**
 * Contrato devolvido ao front. Campos que dependem de dado que a conta pode
 * não fornecer (sem pixel → sem receita → sem ROAS/CPA) vêm como `null`,
 * nunca 0 — o front exibe "—". Nunca inventamos número.
 */
export interface CampanhaLeitura {
  externalId: string;
  nome: string;
  objetivo: string;
  status: string;
  verbaDiaria: number | null;
  investido: number;
  impressoes: number;
  cliques: number;
  leads: number | null;
  compras: number | null;
  receita: number | null;
  cpl: number | null;
  cpa: number | null;
  roas: number | null;
  ctr: number | null;
}

@Injectable()
export class CampanhasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metaAdsClient: MetaAdsClient,
    private readonly cofre: CofreService,
    private readonly metricasService: MetricasService,
  ) {}

  /**
   * Leitura ao vivo (RF-021, só leitura): busca campanhas + insights da conta
   * real, junta por campanha, calcula KPIs onde há dado e devolve `null` onde
   * não há. Este passo não persiste métricas — isso é o worker de ingestão.
   */
  async listarPorProjeto(organizacaoId: string, projetoId: string): Promise<CampanhaLeitura[]> {
    const projeto = await this.prisma.projeto.findFirst({
      where: { id: projetoId, organizacaoId },
    });
    if (!projeto) {
      throw new NotFoundException('Projeto não encontrado.');
    }

    // Decifra o token só aqui, no instante da chamada — nunca o persiste nem o loga.
    const accessToken = this.cofre.decifrar(projeto.tokenRef);
    const externalId = projeto.metaExternalId;

    const [campanhas, insights] = await Promise.all([
      this.metaAdsClient.buscarCampanhas(externalId, accessToken),
      this.metaAdsClient.buscarInsights(externalId, accessToken),
    ]);

    const insightPorCampanha = new Map(insights.map((i) => [i.campanhaExternalId, i]));

    return campanhas.map((campanha) => {
      const insight = insightPorCampanha.get(campanha.externalId);
      const investido = insight?.investido ?? 0;
      const leads = insight?.leads ?? null;
      const compras = insight?.compras ?? null;
      const receita = insight?.receita ?? null;
      const cliques = insight?.cliques ?? 0;
      const impressoes = insight?.impressoes ?? 0;

      const kpis = this.metricasService.calcularKpis({
        investimento: investido,
        leads: leads ?? 0,
        compras: compras ?? 0,
        receita: receita ?? 0,
        cliques,
        impressoes,
      });

      return {
        externalId: campanha.externalId,
        nome: campanha.nome,
        objetivo: campanha.objetivo,
        status: campanha.status,
        // daily_budget vem em centavos; sem dado (ABO) → null.
        verbaDiaria: campanha.verbaDiariaCentavos != null ? campanha.verbaDiariaCentavos / 100 : null,
        investido,
        impressoes,
        cliques,
        leads,
        compras,
        receita,
        // KPIs derivados: null quando o dado-fonte não existe (sem inventar).
        cpl: leads != null ? kpis.cpl : null,
        cpa: compras != null ? kpis.cpa : null,
        roas: receita != null ? kpis.roas : null,
        ctr: impressoes > 0 ? kpis.ctr : null,
      };
    });
  }

  // TODO (Bloco 3 — escrita, fora deste passo): criar/importar/editar/pausar/arquivar.
}
