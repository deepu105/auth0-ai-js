import 'dotenv/config'
import { interact, Auth0CIBAAuthorizer, PollingCIBAAuthorizationReceiver, AuthorizationError } from '@auth0/ai';
import { tokens } from '@auth0/ai/tokens';

function add(a, b) {
  const accessToken = tokens().accessToken;
  if (!accessToken) {
    throw new AuthorizationError('You need authorization to perform this action', 'insufficient_scope', { scope: [ 'openid', 'add' ] });
  }
  return a + b;
}

const authorizer = new Auth0CIBAAuthorizer({
  domain: process.env['DOMAIN'],
  clientID: process.env['CLIENT_ID'],
  clientSecret: process.env['CLIENT_SECRET']
});
const receiver = new PollingCIBAAuthorizationReceiver('https://ai-117332.us.auth0.com/oauth/token');

const interactiveAdd = interact(add, authorizer, receiver);
const user = {
  id: 'auth0|672d15e3a67830e930d6679b'
}

let rv = await interactiveAdd({ user: user }, 1, 2);
console.log(rv)
