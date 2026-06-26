import { Injectable, Logger } from '@nestjs/common';
import { MetricasService } from './metricas.service';

/**
 * Worker de ingestão diária (RF-017, RNF-002).
 * Reusa MetricasService — a mesma lógica de cálculo de KPI usada
 * pela API quando o painel é consultado, evitando duas implementações
 * divergentes da mesma regra de negócio.
 *
 * TODO: registrar como cron job via @nestjs/bullmq (ex.: 6h da manhã,
 * configurável), processando todas as campanhas com status 'ativa'.
 */
@Injectable()
export class IngestaoWorker {
  private readonly logger = new Logger(IngestaoWorker.name);

  constructor(private readonly metricasService: MetricasService) {}

  async executar() {
    this.logger.log('Ingestão diária ainda não implementada');
  }
}
