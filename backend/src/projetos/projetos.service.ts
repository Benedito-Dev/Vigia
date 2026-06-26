import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetaAdsClient } from '../integracoes/meta-ads/meta-ads.client';

@Injectable()
export class ProjetosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metaAdsClient: MetaAdsClient,
  ) {}

  async listarPorOrganizacao(organizacaoId: string) {
    return this.prisma.projeto.findMany({ where: { organizacaoId } });
  }

  // TODO (RF-005, RF-006): conectar(organizacaoId, dto)
  //   1. metaAdsClient.validarConta(dto.externalId, dto.accessToken)
  //   2. se inválido -> lançar erro sem criar registro (RF-006)
  //   3. se válido -> salvar token no cofre, persistir token_ref (nunca o token cru)
}
