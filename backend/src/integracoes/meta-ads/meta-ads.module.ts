import { Module } from '@nestjs/common';
import { MetaAdsClient } from './meta-ads.client';

@Module({
  providers: [MetaAdsClient],
  exports: [MetaAdsClient],
})
export class MetaAdsModule {}
