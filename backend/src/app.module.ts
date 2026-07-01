import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CofreModule } from './common/cofre/cofre.module';
import { AuthModule } from './auth/auth.module';
import { OrganizacoesModule } from './organizacoes/organizacoes.module';
import { ProjetosModule } from './projetos/projetos.module';
import { CampanhasModule } from './campanhas/campanhas.module';
import { ConjuntosModule } from './conjuntos/conjuntos.module';
import { CriativosModule } from './criativos/criativos.module';
import { MetricasModule } from './metricas/metricas.module';
import { BenchmarksModule } from './benchmarks/benchmarks.module';
import { MonitoramentoModule } from './monitoramento/monitoramento.module';
import { AprovacoesModule } from './aprovacoes/aprovacoes.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { MetaAdsModule } from './integracoes/meta-ads/meta-ads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CofreModule,
    AuditoriaModule,
    MetaAdsModule,
    AuthModule,
    OrganizacoesModule,
    ProjetosModule,
    CampanhasModule,
    ConjuntosModule,
    CriativosModule,
    MetricasModule,
    BenchmarksModule,
    MonitoramentoModule,
    AprovacoesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
