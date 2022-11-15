import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepositor: Repository<User>,
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  // Esto se ejecuta cuando el payload no ha expirado, y si la firma
  // hace match con el token
  async validate(payload: any): Promise<User> {
    const { id } = payload;

    const user = await this.userRepositor.findOneBy({ id });

    if (!user) {
      throw new UnauthorizedException('Token inválido')
    }

    if (!user.isActive) {
      throw new UnauthorizedException('El usuario esta inactivo')
    }

    // Este user al retornarlo se va añadir en la request.
    // Luego vamos a tenerlo disponible en toda la app.
    return user;
  }
}
