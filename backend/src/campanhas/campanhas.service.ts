import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetaAdsClient } from '../integracoes/meta-ads/meta-ads.client';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class CampanhasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metaAdsClient: MetaAdsClient,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async listarPorProjeto(projetoId: string) {
    return this.prisma.campanha.findMany({
      where: { projetoId },
      include: { conjuntos: true },
    });
  }

  // TODO (RF-009): criar(...) -> sempre cria na Meta em status PAUSED,
  //   independente do que o usuário selecionar; registra em auditoriaService.
  // TODO (RF-010): importar(...) -> lê campanha existente via Graph API
  //   sem alterar o status dela na Meta.
  // TODO (RF-011): editar(...) -> se aumento de verba > escala_max_pct_dia,
  //   cria item em Aprovacao em vez de aplicar direto.
  // TODO (RF-012): pausar(...) -> ação direta, sempre permitida, sem aprovação.
  // TODO (RF-013): reativar(...) -> direta se pausada por user; via Aprovacao
  //   se foi pausada pelo sistema (status pausada_ia).
  // TODO (RF-014): arquivar(...) -> encerra monitoramento, preserva histórico.
}
