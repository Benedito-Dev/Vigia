import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AlertasService } from './alertas.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/metrics')
export class MonitoramentoController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get('alerts')
  listarAlertas(@Query('campanha_id') campanhaId: string) {
    return this.alertasService.listarAbertos(campanhaId);
  }

  // TODO: GET /daily (RF-021), GET /trend (RF-023)
}
