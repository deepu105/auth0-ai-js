//import { generate, defineTool } from '@genkit-ai/ai';

export class GenkitAgent {
  generate
  model
  tools
  
  // FIXME: don't pass generate in.  has import errors currently without
  constructor(generate, model, tools) {
    this.generate = generate
    this.model = model
    this.tools = tools
  }
  
  async prompt(message, ctx) {
    console.log('genkit agent prompting...');
    console.log(message)
    
  }
  
}
