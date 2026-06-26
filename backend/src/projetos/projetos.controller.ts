import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';
import { ProjetosService } from './projetos.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/projetos')
export class ProjetosController {
  constructor(private readonly projetosService: ProjetosService) {}

  @Get()
  listar(@CurrentUser() user: RequestUser) {
    return this.projetosService.listarPorOrganizacao(user.organizacaoId);
  }

  // TODO: POST /connect (RF-005, RF-006)
  // TODO: PUT /:id/safety-limits (RF-008)
}
