import { Module } from '@nestjs/common';
import { ConjuntosService } from './conjuntos.service';

@Module({
  providers: [ConjuntosService],
  exports: [ConjuntosService],
})
export class ConjuntosModule {}
