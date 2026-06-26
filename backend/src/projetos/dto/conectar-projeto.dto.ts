import { IsNotEmpty, IsString } from 'class-validator';

// RF-005: conectar conta via token manual (Ad Account ID + Access Token)
export class ConectarProjetoDto {
  @IsString()
  @IsNotEmpty()
  clienteNome: string;

  @IsString()
  @IsNotEmpty()
  nicho: string;

  @IsString()
  @IsNotEmpty()
  externalId: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
