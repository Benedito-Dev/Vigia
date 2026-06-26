import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConjuntosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorCampanha(campanhaId: string) {
    return this.prisma.conjunto.findMany({ where: { campanhaId } });
  }
}
