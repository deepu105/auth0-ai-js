import { AuthorizationOptions } from './errors/authorizationerror';

export interface Authorizer {
  authorize(params: AuthorizationOptions);
}

export interface Receiver {
  receive(transactionID: string);
}

