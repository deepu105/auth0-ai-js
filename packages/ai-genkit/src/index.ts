// FIXME: build issues due to no default export from zod?
//import { generate } from '@genkit-ai/ai';
import { CIBAAuthorizer, FSStore, AuthorizationError, agentAsyncStorage } from '@auth0/ai';

export async function loop(generate, params, ctx) {
  console.log('genkit loop...');
  
  return agentAsyncStorage.run(ctx || {}, async () => {
    try {
      return await generate(params);
    } catch (ex) {
      console.log('???')
      console.log(ex)
      console.log(ex.scope);
    }
  });
}
