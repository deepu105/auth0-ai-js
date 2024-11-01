import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CIBAAuthorizer } from '../src/ciba-authorizer'

describe('CIBAAuthorizer#authorize', () => {
  
  it('should request authorization with scope', async () => {
    vi.stubGlobal('fetch', vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () => {
          return Promise.resolve({ auth_req_id: '1c266114-a1be-4252-8ad1-04986c5b9ac1' });
        }
      })
    }))
    
    const authorizer = new CIBAAuthorizer('http://example.test/bc-authorize')
    
    const x = await authorizer.authorize({ scope: [ 'urn:example:channel=HBO', 'urn:example:rating=G,PG-13' ] })
    expect(fetch).toHaveBeenCalledWith('http://example.test/bc-authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'scope=urn%3Aexample%3Achannel%3DHBO+urn%3Aexample%3Arating%3DG%2CPG-13'
    });
    expect(x).toEqual('1c266114-a1be-4252-8ad1-04986c5b9ac1')
  })
  
  it('should request authorization with scope and single ACR value', async () => {
    vi.stubGlobal('fetch', vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () => {
          return Promise.resolve({ auth_req_id: '1c266114-a1be-4252-8ad1-04986c5b9ac1' });
        }
      })
    }))
    
    const authorizer = new CIBAAuthorizer('http://example.test/bc-authorize')
    
    const x = await authorizer.authorize({ acrValues: [ 'myACR' ], scope: [ 'purchase' ] })
    expect(fetch).toHaveBeenCalledWith('http://example.test/bc-authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'acr_values=myACR&scope=purchase'
    });
    expect(x).toEqual('1c266114-a1be-4252-8ad1-04986c5b9ac1')
  })
  
})
