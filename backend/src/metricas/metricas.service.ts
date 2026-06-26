import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricasService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarDiarias(campanhaId: string, periodoDias: number) {
    const desde = new Date();
    desde.setDate(desde.getDate() - periodoDias);

    return this.prisma.metricaDiaria.findMany({
      where: { campanhaId, data: { gte: desde } },
      orderBy: { data: 'asc' },
    });
  }

  /**
   * Calcula os KPIs canônicos (RF-018) a partir dos dados brutos.
   * Puro, determinístico, sem IA — só matemática.
   */
  calcularKpis(input: {
    investimento: number;
    leads: number;
    compras: number;
    receita: number;
    cliques: number;
    impressoes: number;
  }) {
    return {
      cpl: input.leads > 0 ? input.investimento / input.leads : null,
      cpa: input.compras > 0 ? input.investimento / input.compras : null,
      roas: input.investimento > 0 ? input.receita / input.investimento : null,
      ctr: input.impressoes > 0 ? input.cliques / input.impressoes : null,
    };
  }

  // TODO (RF-017): ingerir(campanhaId) -> busca via MetaAdsClient,
  //   normaliza, calcula KPIs e grava em metricaDiaria.
}
