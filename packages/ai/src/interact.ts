import { agentAsyncStorage } from './async-storage';
import { AuthorizationOptions, AuthorizationError } from './errors/authorizationerror';

export function interact(fn, authorizer, receiver) {
  
  const ifn = async function(ctx, ...args) {
    return agentAsyncStorage.run(ctx, async () => {
      const store = agentAsyncStorage.getStore();
      
      try {
        return await fn.apply(undefined, args);
      } catch (error) {
        if (error instanceof AuthorizationError) {
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
          
          var params: AuthorizationOptions = {};
          if (store.user) {
            params.loginHint = store.user.id;
          }
          
          params.acrValues = error.acrValues;
          params.maxAge = error.maxAge;
          params.scope = error.scope;
          params.realm = error.realm;
          
          var transactionID = await authorizer.authorize(params);
          var token = await receiver.receive(transactionID);
          ctx.tokens = {
            accessToken: token
          };
          return ifn.apply(undefined, arguments);
        }
        
        throw error;
      }
    });
  };
  
  return ifn;
}
