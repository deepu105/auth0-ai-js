import 'dotenv/config'
import { defineCommand, runMain } from 'citty';
// NOTE: this throws errors that were fixed by commenting out unknown symbols
// in node_modules/@genkit-ai/ai/lib/index.mjs
//import { generate, defineTool } from '@genkit-ai/ai';
//import { configureGenkit } from '@genkit-ai/core';
import { genkit } from 'genkit';
import openAI, { gpt4o } from 'genkitx-openai';
//import { openAI, gpt4o } from 'genkitx-openai';
import * as z from 'zod';
import { interact, CIBAAuthorizer, FSStore, PollingCIBAAuthorizationReceiver, Auth0CIBAAuthorizer } from '@auth0/ai';
import { loop, Orchestrator, Agent } from '@auth0/ai-genkit';
import { buy } from './tools/buy';

console.log('genkit...');
console.log(openAI)
console.log(gpt4o)


const ai = genkit({
  plugins: [ openAI.openAI({ apiKey: process.env.OPENAI_API_KEY }) ],
  model: gpt4o,
});

const buyToolInputSchema = z.object({ ticker: z.string(), qty: z.number() });
const buyTool = ai.defineTool(
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
  async run({ args }) {
    console.log(args);
    
    if (args.thread) {
      //resume(gpt4o, [ buyTool ], args.thread, args.token);
      //return;
    }
    
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
    
    let rv = await interactivePrompt({ user: user }, gpt4o, [ buyTool ], args.message);
    //console.log(rv.candidates[0].message);
    console.log(rv);
    
    //prompt(gpt4o, [ buyTool], args.message);
  },
});

runMain(main);


/*
configureGenkit({
  plugins: [
    openAI()
  ],
  // Log debug output to tbe console.
  //logLevel: 'debug',
  // Perform OpenTelemetry instrumentation and enable trace collection.
  enableTracingAndMetrics: true,
});
*/


async function prompt(model, tools, message) {
  console.log('GenKit prompt');
  console.log(message);
  
  
  const { text } = await ai.generate({
    //'Hello, I am a stock trader'
    prompt: message,
    tools: tools
  });
  console.log(text);
  return text;
  
  
  /*
  let llmResponse = await loop(generate)({
  //let llmResponse = await generate({
    model: model,
    prompt: message,
    tools: tools
  });
  */
  
  //return llmResponse;
  
  /*
  const app = new Orchestrator();
  app.agent = new Agent(generate, model, tools)
  //app.authorizer = new CIBAAuthorizer("http://localhost:3000/oauth2/bc-authorize");
  app.authorizer = new Auth0CIBAAuthorizer({
    domain: process.env['DOMAIN'],
    clientID: process.env['CLIENT_ID'],
    clientSecret: process.env['CLIENT_SECRET']
  });
  app.receiver =  new PollingCIBAAuthorizationReceiver('https://ai-117332.us.auth0.com/oauth/token');
  app.historyStore = new FSStore(".");
  
  //const response = await app.prompt(message);
  const response = await app.promptEx(generate, {
    model: model,
    prompt: message,
    tools: tools
  });
  if (response) {
    console.log(response.message);
  }
  */
}
