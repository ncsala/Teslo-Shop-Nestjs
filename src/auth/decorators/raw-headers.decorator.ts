import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

// Para crear un decorador personalizado.
export const RawHeaders = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  
  return request.rawHeaders
});
