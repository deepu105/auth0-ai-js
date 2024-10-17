import { defineCommand, runMain } from 'citty';
import { OpenAIAgent, FunctionTool } from "llamaindex";
import { loop } from '../../../packages/ai-llamaindex'; // TODO: replace with '@auth0/ai-llamaindex'
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
    },
    token: {
      alias: "C",
      type: "string",
      description: "Access token for taking actions",
    },
    thread: {
      alias: "t",
      type: "string",
      description: "Thread to continue",
    },
  },
  run({ args }) {
    prompt(args.message);
  },
});

runMain(main);

async function prompt(message) {
  exec(message)
}

async function resume(threadID, token) {
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

async function exec(message) {
  const agent = new OpenAIAgent({
    tools: [ buyTool ],
    verbose: true
  });
  
  const response = await loop(agent, { message: message });
  if (response) {
    console.log(response.message);
  }
}
