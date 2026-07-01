import { BadRequestException, Injectable, Logger } from '@nestjs/common';

/**
 * Único ponto de contato com a Graph/Insights API da Meta.
 * Nenhum outro service do sistema deve chamar a Meta diretamente —
 * rate limit (RNF-011) e backoff exponencial ficam garantidos
 * uma única vez aqui, em vez de reimplementados em cada módulo.
 *
 * Neste incremento, TODAS as chamadas são de LEITURA (GET). Nada aqui
 * cria, edita ou pausa qualquer coisa na conta real do cliente.
 */

export interface ContaMeta {
  externalId: string;
  nome: string;
  /** account_status da Meta: 1 = ativa, outros = pausada/cobrança/etc. */
  accountStatus: number;
  /** ISO 4217, ex.: 'BRL' — usado para exibir valores. */
  moeda: string;
}

export interface CampanhaMeta {
  externalId: string;
  nome: string;
  objetivo: string;
  status: string;
  /** daily_budget vem em centavos (menor unidade da moeda); null se ABO/sem CBO. */
  verbaDiariaCentavos: number | null;
}

export interface InsightCampanhaMeta {
  campanhaExternalId: string;
  investido: number;
  impressoes: number;
  cliques: number;
  /** null quando não há pixel/evento — nunca 0 falso (RF: nunca inventar número). */
  leads: number | null;
  compras: number | null;
  receita: number | null;
}

@Injectable()
export class MetaAdsClient {
  private readonly logger = new Logger(MetaAdsClient.name);
  private readonly versao = process.env.META_API_VERSION ?? 'v21.0';
  private readonly base = 'https://graph.facebook.com';

  /**
   * GET base contra a Graph API. Lê e devolve JSON já parseado.
   * Erros da Meta viram BadRequestException com a mensagem original —
   * o chamador (RF-006) decide se cria ou não o projeto.
   */
  private async get<T>(caminho: string, accessToken: string, params: Record<string, string>): Promise<T> {
    const query = new URLSearchParams({ ...params, access_token: accessToken });
    const url = `${this.base}/${this.versao}/${caminho}?${query.toString()}`;

    let resposta: Response;
    try {
      resposta = await fetch(url, { method: 'GET' });
    } catch (erro) {
      this.logger.error(`Falha de rede ao chamar a Meta: ${String(erro)}`);
      throw new BadRequestException('Não foi possível contatar a Meta. Tente novamente.');
    }

    const corpo = (await resposta.json()) as { error?: { message?: string } } & T;
    if (!resposta.ok || corpo.error) {
      const msg = corpo.error?.message ?? `Erro ${resposta.status} da Meta`;
      // Nunca logar o token; só a mensagem de erro da Meta.
      this.logger.warn(`Meta respondeu erro: ${msg}`);
      throw new BadRequestException(msg);
    }

    return corpo;
  }

  /**
   * RF-005: valida a conta batendo em GET /{ad-account-id}. Se o token/ID
   * forem inválidos, a Meta responde erro e isto lança — sem criar nada.
   */
  async validarConta(externalId: string, accessToken: string): Promise<ContaMeta> {
    const id = this.normalizarId(externalId);
    const dados = await this.get<{
      id: string;
      name: string;
      account_status: number;
      currency: string;
    }>(id, accessToken, { fields: 'name,account_status,currency' });

    return {
      externalId: id,
      nome: dados.name,
      accountStatus: dados.account_status,
      moeda: dados.currency,
    };
  }

  /** Lista as campanhas da conta (leitura). */
  async buscarCampanhas(externalId: string, accessToken: string): Promise<CampanhaMeta[]> {
    const id = this.normalizarId(externalId);
    const dados = await this.get<{
      data: Array<{
        id: string;
        name: string;
        objective: string;
        status: string;
        daily_budget?: string;
      }>;
    }>(`${id}/campaigns`, accessToken, {
      fields: 'name,objective,status,daily_budget',
      limit: '200',
    });

    return dados.data.map((c) => ({
      externalId: c.id,
      nome: c.name,
      objetivo: c.objective,
      status: c.status,
      verbaDiariaCentavos: c.daily_budget != null ? Number(c.daily_budget) : null,
    }));
  }

  /**
   * Insights por campanha (leitura). `spend` sempre vem; leads/compras/receita
   * só existem se houver pixel/eventos configurados — quando ausentes,
   * devolvemos null (o front mostra "—", nunca um número inventado).
   */
  async buscarInsights(externalId: string, accessToken: string): Promise<InsightCampanhaMeta[]> {
    const id = this.normalizarId(externalId);
    const dados = await this.get<{
      data: Array<{
        campaign_id: string;
        spend?: string;
        impressions?: string;
        clicks?: string;
        actions?: Array<{ action_type: string; value: string }>;
        action_values?: Array<{ action_type: string; value: string }>;
      }>;
    }>(`${id}/insights`, accessToken, {
      level: 'campaign',
      fields: 'campaign_id,spend,impressions,clicks,actions,action_values',
      date_preset: 'this_month',
      limit: '200',
    });

    return dados.data.map((linha) => ({
      campanhaExternalId: linha.campaign_id,
      investido: this.paraNumero(linha.spend) ?? 0,
      impressoes: this.paraNumero(linha.impressions) ?? 0,
      cliques: this.paraNumero(linha.clicks) ?? 0,
      leads: this.somarAcao(linha.actions, ['lead', 'onsite_conversion.lead_grouped']),
      compras: this.somarAcao(linha.actions, ['purchase', 'omni_purchase']),
      receita: this.somarAcao(linha.action_values, ['purchase', 'omni_purchase']),
    }));
  }

  /** Aceita 'act_123' ou '123' e normaliza para o formato que a Graph API espera. */
  private normalizarId(externalId: string): string {
    const limpo = externalId.trim();
    return limpo.startsWith('act_') ? limpo : `act_${limpo}`;
  }

  private paraNumero(valor?: string): number | null {
    if (valor == null || valor === '') return null;
    const n = Number(valor);
    return Number.isFinite(n) ? n : null;
  }

  /**
   * Soma os valores de um conjunto de action_types. Retorna null (não 0)
   * quando nenhum dos tipos existe — a ausência do dado é significativa
   * (sem pixel → sem conversão medida → "—", não "zero conversões").
   */
  private somarAcao(
    acoes: Array<{ action_type: string; value: string }> | undefined,
    tipos: string[],
  ): number | null {
    if (!acoes) return null;
    const relevantes = acoes.filter((a) => tipos.includes(a.action_type));
    if (relevantes.length === 0) return null;
    return relevantes.reduce((soma, a) => soma + (this.paraNumero(a.value) ?? 0), 0);
  }
}
