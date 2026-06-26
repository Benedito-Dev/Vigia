import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BenchmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async buscar(nicho: string, tipoFunil: string, ticketRange: string, kpi: string) {
    return this.prisma.benchmark.findFirst({
      where: { nicho, tipoFunil, ticketRange, kpi },
    });
    // RF-019: se não encontrar, o chamador deve atribuir status
    // "sem dado de comparação" — nunca um falso "dentro da média".
  }
}
