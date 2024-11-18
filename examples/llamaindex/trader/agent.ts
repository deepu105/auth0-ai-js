import 'dotenv/config'
import { defineCommand, runMain } from 'citty';
import { OpenAIAgent, FunctionTool } from "llamaindex";
import { interact, Auth0CIBAAuthorizer, CIBAAuthorizer, PollingCIBAAuthorizationReceiver, FSStore } from '@auth0/ai';
import { Orchestrator } from '@auth0/ai-llamaindex';
import { buy } from './tools/buy';


const main = defineCommand({
  meta: {
    name: "trader",
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
    
    let rv = await interactivePrompt({ user: user }, args.message);
    console.log(rv.message);
  },
});

runMain(main);

async function prompt(message) {
  const buyTool = FunctionTool.from(buy,
    {
      name: "buy",
      description: "Use this function to buy stock",
      parameters: {
        type: "object",
        properties: {
          ticker: {
            type: "string",
            description: "The ticker symbol",
          },
          qty: {
            type: "number",
            description: "The quantity",
          },
        },
        required: ["ticker", "qty"],
      },
    },
  );

  const agent = new OpenAIAgent({
    tools: [ buyTool ],
    verbose: true
  });
  
  return await agent.chat({ message: message });
  
  /*
  const app = new Orchestrator();
  app.agent = agent;
  app.authorizer = new Auth0CIBAAuthorizer({
    domain: 'ai-117332.us.auth0.com',
    clientID: process.env['CLIENT_ID'],
    clientSecret: process.env['CLIENT_SECRET']
  });
  app.receiver = new PollingCIBAAuthorizationReceiver('https://ai-117332.us.auth0.com/oauth/token');
  app.historyStore = new FSStore(".");
  
  
  const response = await app.prompt(message);
  if (response) {
    console.log(response.message);
  }
  */
}

