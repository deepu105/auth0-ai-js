export class Orchestrator {
  agent
  authorizer
  historyStore
  
  constructor() {
    console.log('new base orchestrator...');
  }
  
  async prompt(message, ctx) {
    console.log('prompting...');
    console.log(message)
  }
}
