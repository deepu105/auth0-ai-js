export function loop(generate) {
  
  
  const lfn = async function(params) {
    // https://firebase.google.com/docs/genkit/tool-calling
    // manually handle tool calling, so that we can obtain history and save it as needed
    params.returnToolRequests = true;
    
    let llmResponse;
    while (true) {
      llmResponse = await generate(params);
      const toolRequests = llmResponse.toolRequests();
      if (toolRequests.length < 1) {
        break;
      }
      //const toolResponses: ToolResponsePart[] = await Promise.all(
      const toolResponses = await Promise.all(
        toolRequests.map(async (part) => {
          const tool = params.tools.find((tool) => tool.__action.name == part.toolRequest.name);
          if (!tool) {
            throw Error('Tool not found');
          }
          
          const output = await tool(tool.__action.inputSchema.parse(part.toolRequest?.input));
          return {
            toolResponse: {
              name: part.toolRequest.name,
              ref: part.toolRequest.ref,
              output: output,
            }
          };
        })
      );
      //params.messages = llmResponse.messages;
      params.history = llmResponse.toHistory();
      params.prompt = toolResponses;
    }
    
    return llmResponse;
  }
  return lfn;
}
