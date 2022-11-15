import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { LoginUserDto, CreateUserDto } from './dto';
import { User } from './entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';
import { RawHeaders } from './decorators/raw-headers.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // Decorador personalizado
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string
    // Se podria obtener el usuario de la request de express,
    // pero no es lo adecuado pq no pasaria por algunas validaciones
    // @Req() request: Express.Request
  ) {
    // Si viniera directo de la request de express
    // console.log({user: request.user]})


    return {
      ok: true,
      msg: 'Esta ruta no hace nada',
      user,
      userEmail,
      rawHeaders
    };
  }
}
