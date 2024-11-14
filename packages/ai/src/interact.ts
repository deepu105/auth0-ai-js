import { agentAsyncStorage } from './async-storage';
import { AuthorizationOptions, AuthorizationError } from './errors/authorizationerror';

export function interact(fn, authorizer) {
  console.log('interact...');
  
  return async function(ctx, ...args) {
    
    return agentAsyncStorage.run(ctx, async () => {
      const store = agentAsyncStorage.getStore();
      
      try {
        return await fn.apply(undefined, args);
      } catch (error) {
        // The function threw an `AuthorizationError`, indicating that the
        // authentication context is not sufficient.  This error _may_ be
        // remediable by authenticating the user or obtaining their consent.
        //
        // This error is typically the result of an HTTP authentication
        // challenge received at run-time.  Endpoints that respond with such
        // challenges are encouraged to use the attributes defined by
        // [RFC 6750][1] and [RFC 9470][2] so that the necessary authorization
        // can be obtained by interacting with the user.
        //
        // [1]: https://datatracker.ietf.org/doc/html/rfc6750
        // [2]: https://datatracker.ietf.org/doc/html/rfc9470
        if (error instanceof AuthorizationError) {
          var params: AuthorizationOptions = {};
          if (store.user) {
            params.loginHint = store.user.id;
          }
          
          params.acrValues = error.acrValues;
          params.maxAge = error.maxAge;
          params.scope = error.scope;
          params.realm = error.realm;

          console.log('--');
          console.log(store);

          var transactionID = await authorizer.authorize(params);
          console.log(transactionID)
          return
        }
        
        
        console.log('RETHROW');
        console.log(error);
      }
    });
  }
}
