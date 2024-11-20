import { agentAsyncStorage } from './async-storage'

export function session() {
  const store = agentAsyncStorage.getStore();
  return store.session || {};
}
