import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';
import { CampanhasService } from './campanhas.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/campaigns')
export class CampanhasController {
  constructor(private readonly campanhasService: CampanhasService) {}

  @Get()
  listar(@CurrentUser() user: RequestUser, @Query('projeto_id') projetoId: string) {
    return this.campanhasService.listarPorProjeto(user.organizacaoId, projetoId);
  }

  // TODO: POST / (RF-009), PATCH /:id (RF-011), DELETE /:id (RF-014)
}
