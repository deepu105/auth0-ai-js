import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CIBAAuthorizer } from '../src/ciba-authorizer'

describe('CIBAAuthorizer#authorize', () => {
  
  it('should do sometghin', async () => {
    vi.stubGlobal('fetch', () => {
      console.log('stubbed fetch...');
      
      return Promise.resolve({
        ok: true,
        json: () => {
          return Promise.resolve({ auth_req_id: '123' });
        }
      })
    })
    
    const authorizer = new CIBAAuthorizer('http://example.test/bc-authorize')
    
    const x = await authorizer.authorize({ foo: 'bar' })
    expect(x).toEqual('123')
  })
  
})
