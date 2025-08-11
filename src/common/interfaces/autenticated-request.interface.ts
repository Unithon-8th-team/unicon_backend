import { Request as ExpressRequest } from 'express';
import { AccessTokenPayloads } from './access-token-palyloads.interface';

export interface AuthenticatedRequest extends ExpressRequest {
  user: AccessTokenPayloads;
}
