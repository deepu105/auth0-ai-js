import { AuthorizationOptions } from './errors/authorizationerror';

export interface Authorizer {
  authorize(params: AuthorizationOptions, sessionId?: string);
}

export interface Receiver {
  receive(transactionID: string);
}

