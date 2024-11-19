import { CIBAAuthorizerOptions } from './polling-authorizer'

export class PollingCIBAAuthorizationReceiver {
  url
  clientID
  clientSecret
  
  constructor(options: string | CIBAAuthorizerOptions) {
    if (typeof options === 'string') {
      this.url = options;
    } else {
      this.url = options.url;
      this.clientID = options.clientID;
      this.clientSecret = options.clientSecret;
    }
  }
  
  async receive(transactionID: string) {
    return new Promise(function(resolve, reject) {
    
    
    const handle = setInterval(async function() {
      const body = {
        grant_type: 'urn:openid:params:grant-type:ciba',
        auth_req_id: transactionID,
        client_id: process.env['CLIENT_ID']
      }
      
      //console.log('BODY');
      //console.log(body);
      
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
      
      //console.log('RESUME IT');
      //console.log(transactionID);
      //console.log(token);
      
      return resolve(token);
      
      //self.resume(transactionID, token);
    }, 1000);
    
    })
  }
  
}
