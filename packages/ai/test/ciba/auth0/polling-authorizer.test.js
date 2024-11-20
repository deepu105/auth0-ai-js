import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Auth0PollingCIBAAuthorizer } from '../../../src/ciba/auth0/polling-authorizer'

describe('Auth0PollingCIBAAuthorizer#authorize', () => {
  
  describe('constructor', async () => {
    
    it('should construct with URLs', () => {
      const authorizer = new Auth0PollingCIBAAuthorizer({
        authorizationURL: 'http://example.test/bc-authorize',
        tokenURL: 'http://example.test/token',
        clientId: 's6BhdRkqt3',
        clientSecret: '7Fjfp0ZBr1KtDRbnfVdmIw'
      })
      expect(authorizer.authorizationURL).toBe('http://example.test/bc-authorize')
      expect(authorizer.tokenURL).toBe('http://example.test/token')
      expect(authorizer.clientId).toBe('s6BhdRkqt3')
      expect(authorizer.clientSecret).toBe('7Fjfp0ZBr1KtDRbnfVdmIw')
    }) // should construct with URLs
    
    it('should construct with domain', () => {
      const authorizer = new Auth0PollingCIBAAuthorizer({
        domain: 'example.auth0.com',
        clientId: 's6BhdRkqt3',
        clientSecret: '7Fjfp0ZBr1KtDRbnfVdmIw'
      })
      expect(authorizer.authorizationURL).toBe('https://example.auth0.com/bc-authorize')
      expect(authorizer.tokenURL).toBe('https://example.auth0.com/oauth/token')
      expect(authorizer.clientId).toBe('s6BhdRkqt3')
      expect(authorizer.clientSecret).toBe('7Fjfp0ZBr1KtDRbnfVdmIw')
    }) // should construct with domain
    
  }) // constructor
  
  describe('#authorize', async () => {
    
    it('should request authorization with login hint formatted as subject identifier', async () => {
      vi.stubGlobal('fetch', vi
        .fn()
        .mockImplementationOnce(() => {
          return Promise.resolve({
            ok: true,
            json: () => {
              return Promise.resolve({ auth_req_id: '1c266114-a1be-4252-8ad1-04986c5b9ac1' })
            }
          })
        })
        .mockImplementationOnce(() => {
          return Promise.resolve({
            ok: true,
            json: () => {
              return Promise.resolve({
                access_token: 'G5kXH2wHvUra0sHlDy1iTkDJgsgUO1bN',
                token_type: 'Bearer',
                refresh_token: '4bwc0ESC_IAhflf-ACC_vjD_ltc11ne-8gFPfA2Kx16',
                expires_in: 120,
                id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzcyNiJ9.eyJpc3MiOiJodHRwczovL3NlcnZlci5leGFtcGxlLmNvbSIsInN1YiI6IjI0ODI4OTc2MTAwMSIsImF1ZCI6InM2QmhkUmtxdDMiLCJlbWFpbCI6ImphbmVkb2VAZXhhbXBsZS5jb20iLCJleHAiOjE1Mzc4MTk4MDMsImlhdCI6MTUzNzgxOTUwM30.aVq83mdy72ddIFVJLjlNBX-5JHbjmwK-Sn9Mir-blesfYMceIOw6u4GOrO_ZroDnnbJXNKWAg_dxVynvMHnk3uJc46feaRIL4zfHf6Anbf5_TbgMaVO8iczD16A5gNjSD7yenT5fslrrW-NU_vtmi0s1puoM4EmSaPXCR19vRJyWuStJiRHK5yc3BtBlQ2xwxH1iNP49rGAQe_LHfW1G74NY5DaPv-V23JXDNEIUTY-jT-NbbtNHAxnhNPyn8kcO2WOoeIwANO9BfLF1EFWtjGPPMj6kDVrikec47yK86HArGvsIIwk1uExynJIv_tgZGE0eZI7MtVb2UlCwDQrVlg'
              })
            }
          })
        })
      )
    
      const authorizer = new Auth0PollingCIBAAuthorizer({
        domain: 'example.auth0.com'
      })
      const x = await authorizer.authorize({ loginHint: 'auth0|1234567890', scope: [ 'openid' ] })
      expect(fetch).toHaveBeenCalledWith('https://example.auth0.com/bc-authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'login_hint=%7B%22format%22%3A%22iss_sub%22%2C%22iss%22%3A%22https%3A%2F%2Fexample.auth0.com%2F%22%2C%22sub%22%3A%22auth0%7C1234567890%22%7D&scope=openid&binding_message=IGNORE'
      });
      expect(x).toEqual('G5kXH2wHvUra0sHlDy1iTkDJgsgUO1bN')
    }) // should request authorization with login hint formatted as subject identifier
    
  }) // #authorize
  
})
