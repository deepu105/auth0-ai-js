import { Agent } from './agent';
import { Authorizer } from './authorizer';
import { Store } from './history/store';

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
  
  watch(transactionID) {
    // TODO: make this more generic, so it supports other CIBA bindings other than polling
    console.log('watch: ' + transactionID);
    
    var self = this;
    
    var handle = setInterval(async function() {
      console.log('polling...');
      
      var body = {
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
    
      var json = await response.json();
      console.log(json)
      if (json.error == 'authorization_pending') { return; }
      if (json.error == 'access_denied') {
        clearInterval(handle);
        return;
      }
      
      var token = json.access_token;
      console.log('got token: ' + token);
      clearInterval(handle);
      self.resume(transactionID, token);
    }, 1000)
    
    
  }
  
  async resume(transactionID, token) {
  }
}
