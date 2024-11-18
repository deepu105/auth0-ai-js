import 'dotenv/config'
import { defineCommand, runMain } from 'citty';
import { interact, Auth0CIBAAuthorizer, PollingCIBAAuthorizationReceiver } from '@auth0/ai';
import { prompt } from '../agent-llamaindex';
// -- OR --
//import { prompt } from '../agent-genkit';



const main = defineCommand({
  meta: {
    name: "agent",
    version: "0.0.0",
    description: "An example AI trader with human approval",
  },
  args: {
    message: {
      type: "positional",
      description: "A message to the agent",
      required: false,
    }
  },
  async run({ args }) {
    const authorizer = new Auth0CIBAAuthorizer({
      domain: process.env['DOMAIN'],
      clientID: process.env['CLIENT_ID'],
      clientSecret: process.env['CLIENT_SECRET']
    });
    const receiver = new PollingCIBAAuthorizationReceiver('https://ai-117332.us.auth0.com/oauth/token');
    
    
    const interactivePrompt = interact(prompt, authorizer, receiver);
    const user = {
      id: 'auth0|672d15e3a67830e930d6679b'
    }
    
    let rv = await interactivePrompt({ user: user }, { message: args.message });
    console.log(rv.message);
  },
});

runMain(main);
