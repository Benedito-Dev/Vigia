import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: string) {
    return this.prisma.organizacao.findUnique({ where: { id } });
  }
}
