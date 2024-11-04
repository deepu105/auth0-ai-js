import { Agent } from './agent';
import { Authorizer } from './authorizer';
import { Store } from './history/store';
import { agentAsyncStorage } from './async-storage';

import type { CIBAAuthorizer } from "./ciba-authorizer";

export class Orchestrator {
  agent
  authorizer: Authorizer
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
  
  watch(transactionID) {
    // TODO: make this more generic, so it supports other CIBA bindings other than polling
    console.log('watch: ' + transactionID);
    
    const self = this;
    
    const handle = setInterval(async function() {
      const body = {
        grant_type: 'urn:openid:params:grant-type:ciba',
        auth_req_id: transactionID
      }
      
      const response = await fetch('http://localhost:3000/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(body),
        // ...
      });
    
      const json = await response.json();
      if (json.error == 'authorization_pending') { return; }
      if (json.error == 'access_denied') {
        clearInterval(handle);
        return;
      }
      
      const token = json.access_token;
      clearInterval(handle);
      self.resume(transactionID, token);
    }, 1000)
  }
  
  async resume(transactionID, token) {
  }
}
