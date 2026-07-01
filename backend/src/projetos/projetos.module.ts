import { Module } from '@nestjs/common';
import { ProjetosController } from './projetos.controller';
import { ProjetosService } from './projetos.service';
import { MetaAdsModule } from '../integracoes/meta-ads/meta-ads.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [MetaAdsModule, AuditoriaModule],
  controllers: [ProjetosController],
  providers: [ProjetosService],
  exports: [ProjetosService],
})
export class ProjetosModule {}
