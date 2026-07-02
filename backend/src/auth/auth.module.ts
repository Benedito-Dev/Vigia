import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { JwtStrategy } from './jwt.strategy';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    PassportModule,
    AuditoriaModule,
    // Sem expiresIn global: o TTL do access token é definido pelo TokenService
    // na assinatura, para não haver duas fontes de verdade para a expiração.
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret-troque-em-producao',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtStrategy],
})
export class AuthModule {}
