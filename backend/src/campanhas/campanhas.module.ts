import { Module } from '@nestjs/common';
import { CampanhasController } from './campanhas.controller';
import { CampanhasService } from './campanhas.service';
import { MetaAdsModule } from '../integracoes/meta-ads/meta-ads.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { MetricasModule } from '../metricas/metricas.module';

@Module({
  imports: [MetaAdsModule, AuditoriaModule, MetricasModule],
  controllers: [CampanhasController],
  providers: [CampanhasService],
  exports: [CampanhasService],
})
export class CampanhasModule {}
