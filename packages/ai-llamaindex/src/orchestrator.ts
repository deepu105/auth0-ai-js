import { Orchestrator, AuthorizationError, agentAsyncStorage } from "@auth0/ai";

export class LlamaIndexOrchestrator extends Orchestrator {
  
  constructor() {
    super();
    console.log('new llamaindex orchestrator...');
  }
  
  async prompt(message, ctx) {
    console.log('llama prompting...');
    console.log(message)
    
    // TODO: make this agent interface generic
    
    return agentAsyncStorage.run(ctx || {}, async () => {
      try {
        const response = await this.agent.chat({ message: message });
        return response;
      } catch (ex) {
        //console.log("???");
        //console.log(ex);
        //console.log(ex.scope);
        
        if (ex instanceof AuthorizationError) {
          var transactionID = await this.authorizer.authorize("stock.buy");

          // Slice off the last message, under the assumption that it was a tool call that failed
          // TODO: make this more robust by checking
          var messages = this.agent.chatHistory.slice(0, -1);
          
          console.log('Waiting for approval: ' + transactionID);

          await this.historyStore.store(transactionID, messages);
          return;
        }
        
        // TODO: Feed other errors back into agent
      }
    });
    
    
  }
}
