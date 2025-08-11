import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces';

export const AuthenticatedUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new UnauthorizedException();
    }

    return request.user;
  },
);
