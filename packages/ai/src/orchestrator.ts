import { Agent } from './agent';
import { Authorizer, Receiver } from './authorizer';
import { Store } from './history/store';
import { agentAsyncStorage } from './async-storage';

import type { CIBAAuthorizer } from "./ciba-authorizer";

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
    
    const self = this;
    
    const handle = setInterval(async function() {
      const body = {
        grant_type: 'urn:openid:params:grant-type:ciba',
        auth_req_id: transactionID,
        client_id: process.env['CLIENT_ID']
      }
      
      console.log('BODY');
      console.log(body);
      
      //const response = await fetch('http://localhost:3000/oauth2/token', {
      const response = await fetch('https://ai-117332.us.auth0.com/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from([ process.env['CLIENT_ID'], process.env['CLIENT_SECRET'] ].join(':')).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(body),
        // ...
      });
    
      const json = await response.json();
      //clearInterval(handle);
      //console.log(json)
      //return
      
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
