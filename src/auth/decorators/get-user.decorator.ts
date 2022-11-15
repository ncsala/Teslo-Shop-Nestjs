import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

// Para crear un decorador personalizado.
export const GetUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  if (data === 'email') {
    return request.user.email;
  }

  const user = request.user;

  if (!user) {
    throw new InternalServerErrorException('User not found (request)');
  }
  return user;
});
