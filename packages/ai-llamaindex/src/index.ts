import { agentAsyncStorage } from '../../ai'; // '@auth0/ai';

export function loop(agent, params, ctx) {
  return agentAsyncStorage.run(ctx, async () => {
    try {
      const response = await agent.chat(params);
      return response;
    } catch (ex) {
      console.log('???')
      console.log(ex)
      console.log(ex.scope);
    }
  });
}
