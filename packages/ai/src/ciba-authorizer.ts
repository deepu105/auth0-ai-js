export class CIBAAuthorizer {
  url
  
  constructor(url) {
    this.url = url;
  }
  
  async authorize(scope) {
    var body = {
      scope: scope
    }
    // TODO: acr_values
    // TODO: id_token_hint
    // TODO: login_hint
    // TODO: id_token_hint
    // TODO: login_hint
    // TODO: client authentication
    
    // FIXME: form encode this stuff
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(body),
      // ...
    });
    
    var json = await response.json();
    return json.auth_req_id;
  }
}
