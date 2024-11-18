import { OpenAIAgent, FunctionTool } from "llamaindex";
import { buy } from './tools/buy.js';




export async function prompt(params) {
  console.log('llama index prompt...');
  console.log(params)
  
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
  
  //return await agent.chat({ message: message });
  //try {
    return await agent.chat(params);
    //} catch (ex) {
    //console.log('ex')
    //console.log(ex)
  //}
}
