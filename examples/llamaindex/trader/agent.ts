import { defineCommand, runMain } from 'citty';
import { OpenAIAgent, FunctionTool } from "llamaindex";
import { CIBAAuthorizer, FSStore } from '@auth0/ai';
import { Orchestrator } from '@auth0/ai-llamaindex';
import { buy } from './tools/buy';

import 'dotenv/config'

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
  run({ args }) {
    const agent = new OpenAIAgent({
      tools: [ buyTool ],
      verbose: true
    });
    
    prompt(agent, args.message);
  },
});

runMain(main);

async function prompt(agent, message) {
  const app = new Orchestrator();
  app.agent = agent;
  app.authorizer = new CIBAAuthorizer("http://localhost:3000/oauth2/bc-authorize");
  app.historyStore = new FSStore(".");
  
  
  const response = await app.prompt(message);
  if (response) {
    console.log(response.message);
  }
}


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

