import { defineCommand, runMain } from 'citty';
// NOTE: this throws errors that were fixed by commenting out unknown symbols
// in node_modules/@genkit-ai/ai/lib/index.mjs
import { generate, defineTool } from '@genkit-ai/ai';
import { configureGenkit } from '@genkit-ai/core';
import { openAI, gpt4o } from 'genkitx-openai';
import * as z from 'zod';
import { loop, reenterLoop } from '@auth0/ai-genkit';
import { buy } from './tools/buy';

import 'dotenv/config'

configureGenkit({
  plugins: [
    openAI()
  ],
  // Log debug output to tbe console.
  //logLevel: 'debug',
  // Perform OpenTelemetry instrumentation and enable trace collection.
  enableTracingAndMetrics: true,
});

const buyToolInputSchema = z.object({ ticker: z.string(), qty: z.number() });
const buyTool = defineTool(
  {
    name: "buy",
    description: "Use this function to buy stock",
    inputSchema: buyToolInputSchema,
    outputSchema: z.string(),
  },
  buy
);

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
    if (args.thread) {
      resume(gpt4o, [ buyTool ], args.thread, args.token);
      return;
    }
    
    prompt(gpt4o, [ buyTool], args.message);
    
    /*
    const agent = new OpenAIAgent({
      tools: [ buyTool ],
      verbose: true
    });
    
    
    if (args.thread) {
      resume(agent, args.thread, args.token);
      return;
    }
    
    prompt(agent, args.message);
    */
  },
});

runMain(main);

async function resume(model, tools, threadID, token) {
  console.log('resume...');
  
  const result = await reenterLoop(generate, { model: model, tools: tools }, threadID, { token: token });
  if (result) {
    console.log(result.text())
  }
}

async function prompt(model, tools, message) {
  const result = await loop(generate, {
    model: model,
    prompt: message,
    tools: tools
  });

  //console.log('=== DONE ===');
  if (result) {
    console.log(result.text())
  }
}
