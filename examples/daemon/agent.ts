import 'dotenv/config'
import { defineCommand, runMain } from 'citty';
import { interact, Auth0PollingCIBAAuthorizer } from '@auth0/ai';
//import { prompt } from '../agent-llamaindex';
// -- OR --
import { prompt } from '../agent-genkit';



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
    const authorizer = new Auth0PollingCIBAAuthorizer({
      domain: process.env['DOMAIN'],
      clientId: process.env['CLIENT_ID'],
      clientSecret: process.env['CLIENT_SECRET']
    });
    
    const interactivePrompt = interact(prompt, authorizer);
    const user = {
      id: 'auth0|672d15e3a67830e930d6679b'
    }
    
    let rv = await interactivePrompt({ user: user }, args.message);
    console.log(rv.message);
  },
});

runMain(main);
