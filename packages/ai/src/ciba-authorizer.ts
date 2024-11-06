import { Authorizer } from './authorizer'
import { AuthorizationError, AuthorizationOptions } from './errors/authorizationerror'

export interface CIBAAuthorizerOptions {
  url: string;
  clientID?: string;
  clientSecret?: string;
}


/**
 * Requests authorization by prompting the user via an out-of-band channel from
 * the backend.
 */
export class CIBAAuthorizer implements Authorizer {
  url
  clientID
  clientSecret
  
  constructor(options: string | CIBAAuthorizerOptions) {
    if (typeof options === 'string') {
      this.url = options;
    } else {
      this.url = options.url;
      this.clientID = options.clientID;
      this.clientSecret = options.clientSecret;
    }
  }
  
  async authorize(params: AuthorizationOptions) {
    var headers = {};
    var body: {
      acr_values?: string;
      scope?: string
    } = {}
    
    if (this.clientID && this.clientSecret) {
      headers['Authorization'] = 'Basic ' + Buffer.from([ this.clientID, this.clientSecret ].join(':')).toString('base64')
    }
    
    if (params.acrValues) { body.acr_values = params.acrValues.join(' ') }
    if (params.scope) { body.scope = params.scope.join(' ') }
    
    // TODO: acr_values
    // TODO: id_token_hint
    // TODO: login_hint
    // TODO: id_token_hint
    // TODO: login_hint
    // TODO: client authentication
    
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    const response = await fetch(this.url, {
      method: 'POST',
      headers: headers,
      body: new URLSearchParams(body).toString(),
      // ...
    });
    
    var json = await response.json();
    return json.auth_req_id;
  }
}
