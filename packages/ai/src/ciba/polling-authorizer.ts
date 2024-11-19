import { Authorizer } from '../authorizer'
import { AuthorizationError, AuthorizationOptions } from '../errors/authorizationerror'

export interface CIBAAuthorizerOptions {
  authorizationURL: string;
  tokenURL: string;
  clientID?: string;
  clientSecret?: string;
}


/**
 * Requests authorization by prompting the user via an out-of-band channel from
 * the backend.
 */
export class PollingCIBAAuthorizer implements Authorizer {
  authorizationURL
  tokenURL
  clientID
  clientSecret
  
  constructor(options: CIBAAuthorizerOptions) {
    this.authorizationURL = options.authorizationURL;
    this.tokenURL = options.tokenURL;
    this.clientID = options.clientID;
    this.clientSecret = options.clientSecret;
  }
  
  async authorize(params: AuthorizationOptions) {
    var headers = {};
    var body: {
      login_hint?: string;
      acr_values?: string;
      scope?: string
      binding_message?: string
    } = {}
    
    if (this.clientID && this.clientSecret) {
      headers['Authorization'] = 'Basic ' + Buffer.from([ this.clientID, this.clientSecret ].join(':')).toString('base64')
    }
    
    if (params.loginHint) { body.login_hint = params.loginHint }
    if (params.acrValues) { body.acr_values = params.acrValues.join(' ') }
    if (params.scope) { body.scope = params.scope.join(' ') }
    if (params.bindingMessage) { body.binding_message = params.bindingMessage }
    
    // TODO: id_token_hint
    // TODO: login_hint
    // TODO: id_token_hint
    // TODO: login_hint
    // TODO: client authentication
    
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    const response = await fetch(this.authorizationURL, {
      method: 'POST',
      headers: headers,
      body: new URLSearchParams(body).toString(),
      // ...
    });
    
    var json = await response.json();
    return json.auth_req_id;
  }
}
