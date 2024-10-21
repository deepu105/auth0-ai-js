import { CIBAAuthorizer, FSStore, AuthorizationError, agentAsyncStorage } from '../../ai'; // '@auth0/ai';

export function loop(agent, params, ctx) {
  return agentAsyncStorage.run(ctx || {}, async () => {
    try {
      const response = await agent.chat(params);
      return response;
    } catch (ex) {
      console.log('???')
      console.log(ex)
      console.log(ex.scope);
      
      // NOTE: requires modifications to @llamaindex/core/agent/dist/index.js:L186, callTool
      // NOTE: requires modifications to @llamaindex/core/agent/dist/index.cjs:L188, callTool
      if (ex instanceof AuthorizationError) {
        var authorizer = new CIBAAuthorizer('http://localhost:3000/ciba/bc-authorize');
        var tid = await authorizer.authorize('stock.buy');
        
        // Slice off the last message, under the assumption that it was a tool call that failed
        // TODO: make this more robust by checking
        var messages = agent.chatHistory.slice(0, -1);
        
        var store = new FSStore('.');
        await store.store(tid, messages);
        return;
      }
      
      // TODO: Feed other errors back into agent
    }
  });
}
