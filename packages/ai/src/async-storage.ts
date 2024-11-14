import { AsyncLocalStorage } from 'node:async_hooks';

export const agentAsyncStorage = new AsyncLocalStorage<{
  user: any
  tokens: any
}>();
