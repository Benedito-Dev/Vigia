import { Module } from '@nestjs/common';
import { CampanhasController } from './campanhas.controller';
import { CampanhasService } from './campanhas.service';
import { MetaAdsModule } from '../integracoes/meta-ads/meta-ads.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [MetaAdsModule, AuditoriaModule],
  controllers: [CampanhasController],
  providers: [CampanhasService],
  exports: [CampanhasService],
})
export class CampanhasModule {}
