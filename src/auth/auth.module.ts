import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  
  providers: [AuthService, JwtStrategy],

  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // console.log('Jwt de Config Service:', configService.get('JWT_SECRET'));
        // console.log('Jwt de process.env:', process.env.JWT_SECRET);
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),

    // JwtModule.register({
    //   secret: '234234',
    //   signOptions: {
    //     expiresIn: '2h',
    //   },
    // }),
  ],

  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
