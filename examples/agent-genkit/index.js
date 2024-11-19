import { genkit } from 'genkit';
import * as z from 'zod';
import openAI, { gpt4o } from 'genkitx-openai';
import { FSSessionStore } from '@auth0/ai-genkit';
import { buy } from './tools/buy.js';
import { AuthorizationError } from '@auth0/ai';


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
  const session = ai.createSession({
    store: new FSSessionStore(),
  })
  console.log('created session: ' + session.id);
  
  const chat = session.chat();
  console.log(chat.session);
  console.log(chat.sessionId);
  console.log(chat.session.store);
  
  
  try {
    const { text } = await chat.send({
      //'Hello, I am a stock trader'
      prompt: params.message,
      tools: [ buyTool ]
    });
  
    return { message: {
      //content: 'OK'
      context: text
    } };
  } catch (error) {
    console.log('CAUGHT ERROR IN GENKIT');
    console.log(error)
    
    if (error instanceof AuthorizationError) {
      console.log('AUTHORIZATION ERROR, SAVE THE SESSION');
      
      // TODO: I wish there was a better interface here to explicitly persist
      // the session.  It may also be worth considering wether to inject a
      // system method saying that authorization was requested, in which case
      // `chat.updateMessages()` would be the correct approach.
      await chat.session.store.save(chat.session.id, chat.session.sessionData);
      
      // Set `sessionId` property on the authorization error.
      error.sessionId = chat.session.id;
    }
    
    throw error;
  }
}