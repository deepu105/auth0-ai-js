import { CIBAAuthorizer, CIBAAuthorizerOptions } from './ciba-authorizer'
import { AuthorizationError, AuthorizationOptions } from './errors/authorizationerror'

interface Auth0CIBAAuthorizerOptions extends CIBAAuthorizerOptions {
  domain?: string;
}

/**
 * Requests authorization by prompting the user via an out-of-band channel from
 * the backend.
 */
export class Auth0CIBAAuthorizer extends CIBAAuthorizer {
  
  constructor(options: string | Auth0CIBAAuthorizerOptions) {
    if (typeof options === 'string') {
      if (URL.canParse(options)) {
        super(options)
      } else {
        super('https://' + options + '/bc-authorize')
      }
    } else {
      if (options.domain) {
        options.url = 'https://' + options.domain + '/bc-authorize'
      }
      super(options)
    }
  }
  
}
