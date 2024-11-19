import { Agent } from './agent';
import { Authorizer, Receiver } from './authorizer';
import { Store } from './history/store';
import { agentAsyncStorage } from './async-storage';

export class Orchestrator {
  agent
  authorizer: Authorizer
  receiver: Receiver
  historyStore: Store
  
  constructor() {
    console.log('new base orchestrator...');
  }
  
  async prompt(message, ctx) {
    console.log('prompting...');
    console.log(message)
  }
  
  async run(ctx, callback) {
    return agentAsyncStorage.run(ctx, async () => {
      return callback();
    });
  }
  
  async watch(transactionID) {
    // TODO: make this more generic, so it supports other CIBA bindings other than polling
    console.log('watch: ' + transactionID);
    
    
    var token = await this.receiver.receive(transactionID);
    
    console.log('GOT WTACH TOKEN');
    console.log(token)
    this.resume(transactionID, token);
    
    return;
  }
  
  async resume(transactionID, token) {
  }
}
