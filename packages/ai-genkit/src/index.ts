// FIXME: build issues due to no default export from zod?
//import { generate } from '@genkit-ai/ai';
import { CIBAAuthorizer, FSStore, AuthorizationError, agentAsyncStorage } from '@auth0/ai';

// references:
// https://firebase.google.com/docs/genkit/auth
// NOTE: This doesn't support "dynamic" negotation with the API


export async function loop(generate, params, ctx) {
  console.log('genkit loop...');
  console.log(params);
  console.log(params.tools)
  
  return agentAsyncStorage.run(ctx || {}, async () => {
    let llmResponse;
    
    try {
      // https://firebase.google.com/docs/genkit/tool-calling
      // manually handle tool calling, so that we can obtain history and save it as needed
      
      params.returnToolRequests = true;
      
      //let llmResponse;
      while (true) {
        llmResponse = await generate(params);
        const toolRequests = llmResponse.toolRequests();
        if (toolRequests.length < 1) {
          break;
        }
        //const toolResponses: ToolResponsePart[] = await Promise.all(
        const toolResponses = await Promise.all(
          toolRequests.map(async (part) => {
            
            console.log(part)
            
            const tool = params.tools.find((tool) => tool.__action.name == part.toolRequest.name);
            console.log('exec');
            console.log(tool);
            
            if (!tool) {
              throw Error('Tool not found');
            }
            
            const output = await tool(tool.__action.inputSchema.parse(part.toolRequest?.input));
            console.log('---- output ---');
            console.log(output);
            
            return {
              toolResponse: {
                name: part.toolRequest.name,
                ref: part.toolRequest.ref,
                output: output,
              }
            };
            
            //switch (part.toolRequest.name) {
              //case "specialTool":
              //  return {
              //    toolResponse: {
              //      name: part.toolRequest.name,
              //      ref: part.toolRequest.ref,
              //      output: await specialTool(specialToolInputSchema.parse(part.toolRequest?.input)),
              //    },
              //  };
              //default:
              //  throw Error('Tool not found');
              //}
            }));
        
        console.log('called tools, looping...');
        
        //generateOptions.history = llmResponse.toHistory();
        //generateOptions.prompt = toolResponses;
        
        params.history = llmResponse.toHistory();
        params.prompt = toolResponses;
        
        //break;
      }
      
      return llmResponse;
      
      //return await generate(params);
    } catch (ex) {
      console.log('???')
      console.log(ex)
      console.log(ex.scope);
      //console.log(this);
      //console.log(params)
      
      if (ex instanceof AuthorizationError) {
        console.log('Authorization...');
        
        var authorizer = new CIBAAuthorizer('http://localhost:3000/ciba/bc-authorize');
        var tid = await authorizer.authorize('stock.buy');
        
        console.log(tid);
        var hist = llmResponse.toHistory();
        console.log(hist);
        console.log(hist[1])
        
        // Slice off the last message, under the assumption that it was a tool call that failed
        // TODO: make this more robust by checking
        var messages = hist.slice(0, -1);
        
        var store = new FSStore('.');
        await store.store(tid, messages);
        return;
      }
    }
  });
}
