// https://datatracker.ietf.org/doc/html/rfc6750
// https://datatracker.ietf.org/doc/html/rfc9470

export class AuthorizationError extends Error {
  code: string
  acr: string[]
  maxAge: number
  scope: string[]
  realm: string
  
  constructor(message: string, code: string, params: { acr: string[], maxAge: number, scope: string[], realm: string }) {
    super(message);
    
    this.code = code;
    this.scope = params.scope; // TODO: split into array
    this.acr = params.acr; // TODO: split into array
    this.maxAge = params.maxAge; // TODO: parse into int
    this.realm = params.realm;
  }
}
