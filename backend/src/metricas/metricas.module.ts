import { Module } from '@nestjs/common';
import { MetricasService } from './metricas.service';
import { IngestaoWorker } from './ingestao.worker';
import { MetaAdsModule } from '../integracoes/meta-ads/meta-ads.module';

@Module({
  imports: [MetaAdsModule],
  providers: [MetricasService, IngestaoWorker],
  exports: [MetricasService],
})
export class MetricasModule {}
