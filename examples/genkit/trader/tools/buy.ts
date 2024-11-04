import { AuthorizationError } from '@auth0/ai';
import { tokens } from '@auth0/ai/tokens';

export let buy = async function({ ticker, qty }) {
  //console.log('buy stock!');
  //console.log(ticker);
  //console.log(qty)
  //console.log('BUY: ' + qty + ' ' + ticker);
  
  
  const accessToken = tokens().accessToken;
  if (!accessToken) {
    throw new AuthorizationError('You need authorization to buy stock', 'insufficient_scope', { scope: [ 'stock.buy' ] });
  }
  
  
  return 'OK'
}
