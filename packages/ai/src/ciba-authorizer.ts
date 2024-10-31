import { Authorizer } from './authorizer'
import { AuthorizationError } from './errors/authorizationerror'

/**
 * Requests authorization by prompting the user via an out-of-band channel from
 * the backend.
 */
export class CIBAAuthorizer implements Authorizer {
  url
  
  constructor(url: string) {
    this.url = url;
  }
  
  async authorize(params: AuthorizationError) {
    var body = {
      scope: params.scope.join(' ')
    }
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
      body: new URLSearchParams(body),
      // ...
    });
    
    var json = await response.json();
    return json.auth_req_id;
  }
}
