import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { LoginUserDto, CreateUserDto } from './dto';
import { User } from './entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { UserRole2Guard } from './guards/user-role2.guard';
import { RoleProtected } from './decorators';
import { ValidRoles } from './interfaces';
import { Auth } from './decorators/auth.decorator';

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
  // Este Guard verifica que tenga el token
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // Decorador personalizado
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string,
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
      rawHeaders,
    };
  }

  @Get('private2')
  // Para agregar informacion extra al metodo o controlador,
  // q se quiere ejecutar, se usa muy poco setmetada,
  // usualmente se usan decoradores personalizados
  @SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  // Es el equivalente a SetMetadata de arriba
  @RoleProtected(ValidRoles.admin, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRole2Guard)
  privateRoute3(@GetUser() user: User) {
    return {
      user,
    };
  }

  @Get('private4')
  // Es el equivalente a los dos decoradores se usaron arriba
  // RoleProtected y UseGuards
  @Auth(ValidRoles.admin, ValidRoles.user)
  privateRoute4(@GetUser() user: User) {
    return {
      user,
    };
  }
}
