import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusAprovacao } from '@prisma/client';

@Injectable()
export class AprovacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPendentes(organizacaoId: string) {
    return this.prisma.aprovacao.findMany({
      where: { organizacaoId, status: StatusAprovacao.pendente },
      orderBy: { createdAt: 'asc' },
    });
  }

  // TODO (Bloco 6 — RF-026, RF-027): implementar decidir(id, decisao, usuarioId)
  // verificando hard stops (teto_verba_diaria, cpl_maximo) antes de executar
  // na Meta API, e registrando o resultado via AuditoriaService.
}
