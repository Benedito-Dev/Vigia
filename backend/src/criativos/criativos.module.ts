import { Module } from '@nestjs/common';
import { CriativosService } from './criativos.service';
import { MetaAdsModule } from '../integracoes/meta-ads/meta-ads.module';

@Module({
  imports: [MetaAdsModule],
  providers: [CriativosService],
  exports: [CriativosService],
})
export class CriativosModule {}
