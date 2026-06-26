import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CriativosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarDaBibliotecaMeta(_projetoId: string) {
    // TODO (RF-015): consultar biblioteca de criativos via MetaAdsClient —
    // o Vigia nunca permite upload ou criação, apenas seleção do que já existe.
    return [];
  }

  async vincularAoConjunto(conjuntoId: string, metaExternalId: string, tipo: string, formato: string) {
    return this.prisma.criativo.create({
      data: { conjuntoId, metaExternalId, tipo: tipo as any, formato },
    });
  }
}
