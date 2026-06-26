import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RequestUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret-troque-em-producao',
    });
  }

  async validate(payload: { sub: string; organizacaoId: string; papel: string }): Promise<RequestUser> {
    return { id: payload.sub, organizacaoId: payload.organizacaoId, papel: payload.papel };
  }
}
