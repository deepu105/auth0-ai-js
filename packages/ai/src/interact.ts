import { agentAsyncStorage } from './async-storage';
import { AuthorizationOptions, AuthorizationError } from './errors/authorizationerror';

export function interact(fn, authorizer) {
  console.log('interact...');
  
  return async function(ctx, ...args) {
    console.log('trying withing wrapper...');
    
    
    return agentAsyncStorage.run(ctx, async () => {
      const store = agentAsyncStorage.getStore();
      
      try {
        return await fn.apply(undefined, args);
      } catch (error) {
        if (error instanceof AuthorizationError) {
          console.log('AUTHZ ERROR');
          console.log(error);



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


          /*
          try {

            console.log('awaiting authorization...');
          var transactionID = await authorizer.authorize(error);
          console.log(transactionID)
          } catch (ex) {
            console.log('new ex');
            console.log(ex)
          }
          return
          */
        }
        
        
        console.log('RETHROW');
        console.log(error);
      }
    });
  }
}
