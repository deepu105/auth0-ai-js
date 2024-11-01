import { agentAsyncStorage } from '@auth0/ai';
import { AuthorizationError } from '@auth0/ai';

export let buy = function({ ticker, qty }) {
  //console.log('BUY: ' + qty + ' ' + ticker);
  
  var store = agentAsyncStorage.getStore();
  //console.log(store);
  if (!store.token) {
    throw new AuthorizationError('You need authorization to buy stock', 'insufficient_scope', { scope: [ 'stock.buy' ] });
  }
  
  return 'OK'
}
