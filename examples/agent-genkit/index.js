import { genkit } from 'genkit';
import * as z from 'zod';
import openAI, { gpt4o } from 'genkitx-openai';
import { buy } from './tools/buy.js';


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



export async function prompt(params) {
  const { text } = await ai.generate({
    //'Hello, I am a stock trader'
    prompt: params.message,
    tools: [ buyTool ]
  });
  
  return { message: {
    //content: 'OK'
    context: text
  } };
  
}