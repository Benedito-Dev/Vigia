import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';
import { ProjetosService } from './projetos.service';
import { ConectarProjetoDto } from './dto/conectar-projeto.dto';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/projetos')
export class ProjetosController {
  constructor(private readonly projetosService: ProjetosService) {}

  @Get()
  listar(@CurrentUser() user: RequestUser) {
    return this.projetosService.listarPorOrganizacao(user.organizacaoId);
  }

  // RF-005/RF-006: valida a conta na Meta e conecta como novo projeto.
  @Post('connect')
  conectar(@CurrentUser() user: RequestUser, @Body() dto: ConectarProjetoDto) {
    return this.projetosService.conectar(user.organizacaoId, user.id, dto);
  }

  // TODO: PUT /:id/safety-limits (RF-008)
}
