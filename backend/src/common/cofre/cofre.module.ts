import { Global, Module } from '@nestjs/common';
import { CofreService } from './cofre.service';

/**
 * Global: qualquer módulo que precise cifrar/decifrar segredos (projetos hoje,
 * ingestão amanhã) injeta CofreService sem reimportar o módulo.
 */
@Global()
@Module({
  providers: [CofreService],
  exports: [CofreService],
})
export class CofreModule {}
