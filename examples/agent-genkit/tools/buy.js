import { AuthorizationError } from '@auth0/ai';
import { tokens } from '@auth0/ai/tokens';



export let buy = function({ ticker, qty }) {
  console.log('BUY: ' + qty + ' ' + ticker);
  console.log(tokens())
  
  //throw new Error('something is wrong...')
  
  const accessToken = tokens().accessToken;
  if (!accessToken) {
    throw new AuthorizationError('You need authorization to buy stock', 'insufficient_scope', { scope: [ 'openid', 'stock.buy' ] });
  }
  
  return 'OK'
}
