import { Module } from '@nestjs/common';
import { MonitoramentoController } from './monitoramento.controller';
import { AlertasService } from './alertas.service';
import { BenchmarksModule } from '../benchmarks/benchmarks.module';

@Module({
  imports: [BenchmarksModule],
  controllers: [MonitoramentoController],
  providers: [AlertasService],
  exports: [AlertasService],
})
export class MonitoramentoModule {}
