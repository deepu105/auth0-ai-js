var express = require('express');
var auth0AI = require('@auth0/ai');

// `@auth0/ai` can add human-in-the-loop orchestration to agents written in any
// framework.  Uncomment the example agent written in your preferred framework
// to host it as a stateless HTTP-driven agent using CIBA to obtain
// authorization.
//var agent = require('../../agent-llamaindex');
// -- OR --
var agent = require('../../agent-genkit');



const authorizer = new auth0AI.NotificationCIBAAuthorizer({
  authorizationURL: 'http://localhost:8080/oauth2/bc-authorize',
  clientId: process.env['CLIENT_ID'],
  clientSecret: process.env['CLIENT_SECRET'],
  store: new auth0AI.FSStateStore('.')
});

const interactivePrompt = auth0AI.interact(agent.prompt, authorizer);


var router = express.Router();

router.post('/', function(req, res, next) {
  const user = {
    id: 'auth0|672d15e3a67830e930d6679b'
  }
  
  interactivePrompt({ user: user }, req.body.message)
    .then(function(result) {
      console.log(result)
      
      return res.json({ message: result.message.content })
    })
    .catch(function(error) {
      console.log('ERRROR')
      console.log(error)
    })
});

module.exports = router;
