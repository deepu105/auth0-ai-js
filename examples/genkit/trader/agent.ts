// NOTE: this throws errors that were fixed by commenting out unknown symbols
// in node_modules/@genkit-ai/ai/lib/index.mjs
import { generate, defineTool } from '@genkit-ai/ai';
import { configureGenkit } from '@genkit-ai/core';
import { openAI, gpt4o } from 'genkitx-openai';
import * as z from 'zod';
import { loop } from '@auth0/ai-genkit';
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


/*
const result = await generate({
  model: gpt4o,
  prompt: 'Buy 100 shares of ZEKO',
  tools: [buyTool]
});

console.log(result);
console.log(result.text())
*/

const response = await loop(generate, {
  model: gpt4o,
  prompt: 'Buy 100 shares of ZEKO',
  tools: [buyTool]
});

console.log('=== DONE ===');
 
if (response) {
  console.log(response.text())
}
