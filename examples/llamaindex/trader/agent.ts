import { defineCommand, runMain } from 'citty';
import { OpenAIAgent, FunctionTool } from "llamaindex";
import { loop, reenterLoop } from '../../../packages/ai-llamaindex'; // TODO: replace with '@auth0/ai-llamaindex'
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
    const agent = new OpenAIAgent({
      tools: [ buyTool ],
      verbose: true
    });
    
    
    if (args.thread) {
      resume(agent, args.thread, args.token);
      return;
    }
    
    prompt(agent, args.message);
  },
});

runMain(main);

async function prompt(agent, message) {
  const response = await loop(agent, { message: message });
  if (response) {
    console.log(response.message);
  }
}

async function resume(agent, threadID, token) {
  const response = await reenterLoop(agent, threadID, { token: token });
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

