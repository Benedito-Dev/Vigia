import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Objetivo, TipoOrcamento } from '../../../generated/prisma';

export class CriarCampanhaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEnum(Objetivo)
  objetivo: Objetivo;

  @IsEnum(TipoOrcamento)
  tipoOrcamento: TipoOrcamento;

  @IsNumber()
  @Min(0)
  verbaDiaria: number;
}
