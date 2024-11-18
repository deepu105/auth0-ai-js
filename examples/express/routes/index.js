var express = require('express');
// requires node v23, for require esm
var agent = require('../../agent-llamaindex');
var auth0AI = require('@auth0/ai');

console.log(agent)
console.log(auth0AI)

var router = express.Router();



const authorizer = new auth0AI.Auth0CIBAAuthorizer({
  domain: process.env['DOMAIN'],
  clientID: process.env['CLIENT_ID'],
  clientSecret: process.env['CLIENT_SECRET']
});
const receiver = new auth0AI.PollingCIBAAuthorizationReceiver('https://ai-117332.us.auth0.com/oauth/token');


const interactivePrompt = auth0AI.interact(agent.prompt, authorizer, receiver);

console.log(interactivePrompt)


router.post('/', function(req, res, next) {
  console.log(interactivePrompt)
  
  const user = {
    id: 'auth0|672d15e3a67830e930d6679b'
  }
  
  //agent.prompt(req.body)
  interactivePrompt({ user: user }, req.body)
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
