import { Orchestrator, AuthorizationError, agentAsyncStorage } from "@auth0/ai";

export class GenkitOrchestrator extends Orchestrator {
  
  constructor() {
    super();
    console.log('new llamaindex orchestrator...');
  }
  
  async prompt(message, ctx) {
    console.log('genkit prompting...');
    console.log(message)
    
  }
  
}
