import { genkit, z } from 'genkit';
import { openAI, gpt4o } from 'genkitx-openai';
import { AuthorizationError } from '@auth0/ai';
import { FSSessionStore } from '@auth0/ai-genkit';
import { tokens } from '@auth0/ai/tokens';


const ai = genkit({
  plugins: [ openAI({ apiKey: process.env.OPENAI_API_KEY }) ],
  model: gpt4o,
});

const buy = ai.defineTool(
  {
    name: "buy",
    description: "Use this function to buy stock",
    inputSchema: z.object({
      ticker: z.string(),
      qty: z.number()
    }),
    outputSchema: z.string(),
  },
  async ({ ticker, qty }) => {
    const accessToken = tokens().accessToken;
    if (!accessToken) {
      throw new AuthorizationError('You need authorization to buy stock', 'insufficient_scope', { scope: [ 'openid', 'stock.buy' ] });
    }
  
    return 'OK'
  }
);


export async function prompt(params) {
  const session = ai.createSession({
    store: new FSSessionStore(),
  });
  const chat = session.chat();
  
  
  try {
    const { text } = await chat.send({
      //'Hello, I am a stock trader'
      prompt: params.message,
      tools: [ buy ]
    });
  
    return { message: {
      //content: 'OK'
      context: text
    } };
  } catch (error) {
    if (error instanceof AuthorizationError) {
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
