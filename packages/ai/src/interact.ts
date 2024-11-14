import { agentAsyncStorage } from './async-storage';
import { AuthorizationError } from './errors/authorizationerror';

export function interact(fn) {
  console.log('interact...');
  
  return async function(ctx, ...args) {
    console.log('trying withing wrapper...');
    
    
    return agentAsyncStorage.run(ctx, async () => {
      
      try {
        return await fn.apply(undefined, args);
      } catch (error) {
        if (error instanceof AuthorizationError) {
          console.log('AUTHZ ERROR');
          console.log(error);
          
          
          return
        }
        
        
        console.log('RETHROW');
        console.log(error);
      }
    });
  }
}
