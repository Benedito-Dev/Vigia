import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface RegistrarAuditoriaInput {
  organizacaoId: string;
  ator: string;
  acao: string;
  alvoRef?: string;
  dadosAntes?: Record<string, unknown>;
  dadosDepois?: Record<string, unknown>;
  gatilho?: Record<string, unknown>;
}

/**
 * Único ponto de escrita no REGISTRO_AUDITORIA.
 * Nenhum outro service deve gravar diretamente nessa tabela —
 * a tabela é append-only (RF-029) e essa regra só se sustenta
 * se houver um único caminho de entrada.
 */
@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(input: RegistrarAuditoriaInput) {
    return this.prisma.registroAuditoria.create({
      data: {
        organizacaoId: input.organizacaoId,
        ator: input.ator,
        acao: input.acao,
        alvoRef: input.alvoRef,
        dadosAntes: input.dadosAntes as Prisma.InputJsonValue,
        dadosDepois: input.dadosDepois as Prisma.InputJsonValue,
        gatilho: input.gatilho as Prisma.InputJsonValue,
      },
    });
  }
}
