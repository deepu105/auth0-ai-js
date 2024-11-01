import { Authorizer } from './authorizer'
import { AuthorizationError, AuthorizationOptions } from './errors/authorizationerror'

/**
 * Requests authorization by prompting the user via an out-of-band channel from
 * the backend.
 */
export class CIBAAuthorizer implements Authorizer {
  url
  
  constructor(url: string) {
    this.url = url;
  }
  
  async authorize(params: AuthorizationOptions) {
    var body = {}
    if (params.acrValues) { body.acr_values = params.acrValues.join(' ') }
    if (params.scope) { body.scope = params.scope.join(' ') }
    
    // TODO: acr_values
    // TODO: id_token_hint
    // TODO: login_hint
    // TODO: id_token_hint
    // TODO: login_hint
    // TODO: client authentication
    
    // FIXME: form encode this stuff
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(body).toString(),
      // ...
    });
    
    var json = await response.json();
    return json.auth_req_id;
  }
}
