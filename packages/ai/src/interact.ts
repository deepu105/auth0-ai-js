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
