import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';
import { AprovacoesService } from './aprovacoes.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/approvals')
export class AprovacoesController {
  constructor(private readonly aprovacoesService: AprovacoesService) {}

  @Get()
  listarPendentes(@CurrentUser() user: RequestUser) {
    return this.aprovacoesService.listarPendentes(user.organizacaoId);
  }
}
