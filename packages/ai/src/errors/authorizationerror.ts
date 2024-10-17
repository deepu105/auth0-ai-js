// https://datatracker.ietf.org/doc/html/rfc6750
// https://datatracker.ietf.org/doc/html/rfc9470

export class AuthorizationError extends Error {
  code
  scope
  acrValues
  maxAge
  realm
  
  constructor(message, code, params) {
    super(message);
    
    if (typeof params == 'string') {
      params = { scope: params };
    }
    this.code = code;
    this.scope = params.scope; // TODO: split into array
    this.acrValues = params.acrValues; // TODO: split into array
    this.maxAge = params.maxAge; // TODO: parse into int
    this.realm = params.realm;
  }
}
