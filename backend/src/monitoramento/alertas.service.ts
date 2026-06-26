import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertasService {
  constructor(private readonly prisma: PrismaService) {}

  async listarAbertos(campanhaId: string) {
    return this.prisma.alerta.findMany({
      where: { campanhaId, status: 'aberto' },
      orderBy: { createdAt: 'desc' },
    });
  }

  // TODO (RF-022): avaliarGatilhos(metricaDiaria) -> verifica os 5 gatilhos
  //   da spec (KPI -15% em 7d, CPL +25% em 3d, ROAS < 1.5x, frequência > 3,
  //   custo > 120% do orçamento) e cria Alerta quando disparar.
}
