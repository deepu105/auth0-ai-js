import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CIBAAuthorizer } from '../src/ciba-authorizer'

describe('CIBAAuthorizer#authorize', () => {
  
  describe('constructor', async () => {
    
    it('should construct with client secret', () => {
      const authorizer = new CIBAAuthorizer({ url: 'http://example.test/bc-authorize', clientID: 's6BhdRkqt3', clientSecret: '7Fjfp0ZBr1KtDRbnfVdmIw' })
      expect(authorizer.url).toBe('http://example.test/bc-authorize')
      expect(authorizer.clientID).toBe('s6BhdRkqt3')
      expect(authorizer.clientSecret).toBe('7Fjfp0ZBr1KtDRbnfVdmIw')
    })
    
  })
  
  describe('#authorize', async () => {
    
    it('should request authorization with login hint', async () => {
      vi.stubGlobal('fetch', vi.fn(() => {
        return Promise.resolve({
          ok: true,
          json: () => {
            return Promise.resolve({ auth_req_id: '1c266114-a1be-4252-8ad1-04986c5b9ac1' });
          }
        })
      }))
    
      const authorizer = new CIBAAuthorizer('http://example.test/bc-authorize')
      const x = await authorizer.authorize({ loginHint: 'janedoe@example.com', scope: [ 'openid' ] })
      expect(fetch).toHaveBeenCalledWith('http://example.test/bc-authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'login_hint=janedoe%40example.com&scope=openid'
      });
      expect(x).toEqual('1c266114-a1be-4252-8ad1-04986c5b9ac1')
    }) // should request authorization with login hint
    
    it('should request authorization with ACR value', async () => {
      vi.stubGlobal('fetch', vi.fn(() => {
        return Promise.resolve({
          ok: true,
          json: () => {
            return Promise.resolve({ auth_req_id: '1c266114-a1be-4252-8ad1-04986c5b9ac1' });
          }
        })
      }))
    
      const authorizer = new CIBAAuthorizer('http://example.test/bc-authorize')
      const x = await authorizer.authorize({ loginHint: 'janedoe@example.com', scope: [ 'openid' ], acrValues: [ 'myACR' ] })
      expect(fetch).toHaveBeenCalledWith('http://example.test/bc-authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'login_hint=janedoe%40example.com&acr_values=myACR&scope=openid'
      });
      expect(x).toEqual('1c266114-a1be-4252-8ad1-04986c5b9ac1')
    }) // should request authorization with ACR value
    
    it('should request authorization with multiple scopes', async () => {
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
    }) // should request authorization with multiple scopes
    
    it('should authenticate using HTTP basic scheme', async () => {
      vi.stubGlobal('fetch', vi.fn(() => {
        return Promise.resolve({
          ok: true,
          json: () => {
            return Promise.resolve({ auth_req_id: '1c266114-a1be-4252-8ad1-04986c5b9ac1' });
          }
        })
      }))
    
      const authorizer = new CIBAAuthorizer({ url: 'http://example.test/bc-authorize', clientID: 's6BhdRkqt3', clientSecret: '7Fjfp0ZBr1KtDRbnfVdmIw' })
      const x = await authorizer.authorize({ scope: [ 'openid' ], acrValues: [ 'myACR' ] })
      expect(fetch).toHaveBeenCalledWith('http://example.test/bc-authorize', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic czZCaGRSa3F0Mzo3RmpmcDBaQnIxS3REUmJuZlZkbUl3',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'acr_values=myACR&scope=openid'
      });
      expect(x).toEqual('1c266114-a1be-4252-8ad1-04986c5b9ac1')
    }) // should authenticate using HTTP basic scheme
    
  }) // #authorize
  
})
