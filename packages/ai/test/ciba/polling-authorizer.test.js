import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PollingCIBAAuthorizer } from '../../src/ciba/polling-authorizer'

describe('PollingCIBAAuthorizer#authorize', () => {
  
  describe('constructor', async () => {
    
    it('should construct with client secret', () => {
      const authorizer = new PollingCIBAAuthorizer({
        authorizationURL: 'http://example.test/bc-authorize',
        tokenURL: 'http://example.test/token',
        clientId: 's6BhdRkqt3',
        clientSecret: '7Fjfp0ZBr1KtDRbnfVdmIw'
      })
      expect(authorizer.authorizationURL).toBe('http://example.test/bc-authorize')
      expect(authorizer.tokenURL).toBe('http://example.test/token')
      expect(authorizer.clientId).toBe('s6BhdRkqt3')
      expect(authorizer.clientSecret).toBe('7Fjfp0ZBr1KtDRbnfVdmIw')
    }) // should construct with client secret
    
  }) // constructor
  
  describe('#authorize', async () => {
    
    it('should request authorization with login hint', async () => {
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
    
      const authorizer = new PollingCIBAAuthorizer({
        authorizationURL: 'http://example.test/bc-authorize',
        tokenURL: 'http://example.test/token'
      })
      const x = await authorizer.authorize({ loginHint: 'janedoe@example.com', scope: [ 'openid' ] })
      expect(fetch).toHaveBeenCalledWith('http://example.test/bc-authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'login_hint=janedoe%40example.com&scope=openid'
      });
      expect(x).toEqual('G5kXH2wHvUra0sHlDy1iTkDJgsgUO1bN')
    }) // should request authorization with login hint
    
    it('should request authorization with ACR value', async () => {
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
    
      const authorizer = new PollingCIBAAuthorizer({
        authorizationURL: 'http://example.test/bc-authorize',
        tokenURL: 'http://example.test/token'
      })
      const x = await authorizer.authorize({ loginHint: 'janedoe@example.com', scope: [ 'openid' ], acrValues: [ 'myACR' ] })
      expect(fetch).toHaveBeenCalledWith('http://example.test/bc-authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'login_hint=janedoe%40example.com&acr_values=myACR&scope=openid'
      });
      expect(x).toEqual('G5kXH2wHvUra0sHlDy1iTkDJgsgUO1bN')
    }) // should request authorization with ACR value
    
    it('should request authorization with binding message', async () => {
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
    
      const authorizer = new PollingCIBAAuthorizer({
        authorizationURL: 'http://example.test/bc-authorize'
      })
      const x = await authorizer.authorize({ loginHint: 'janedoe@example.com', scope: [ 'openid' ], bindingMessage: 'W4SCT' })
      expect(fetch).toHaveBeenCalledWith('http://example.test/bc-authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'login_hint=janedoe%40example.com&scope=openid&binding_message=W4SCT'
      });
      expect(x).toEqual('G5kXH2wHvUra0sHlDy1iTkDJgsgUO1bN')
    }) // should request authorization with binding message
    
    it('should request authorization with multiple scopes', async () => {
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
    
      const authorizer = new PollingCIBAAuthorizer({
        authorizationURL: 'http://example.test/bc-authorize'
      })
      const x = await authorizer.authorize({ scope: [ 'urn:example:channel=HBO', 'urn:example:rating=G,PG-13' ] })
      expect(fetch).toHaveBeenCalledWith('http://example.test/bc-authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'scope=urn%3Aexample%3Achannel%3DHBO+urn%3Aexample%3Arating%3DG%2CPG-13'
      });
      expect(x).toEqual('G5kXH2wHvUra0sHlDy1iTkDJgsgUO1bN')
    }) // should request authorization with multiple scopes
    
    it('should authenticate using HTTP basic scheme', async () => {
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
    
      const authorizer = new PollingCIBAAuthorizer({
        authorizationURL: 'http://example.test/bc-authorize',
        clientId: 's6BhdRkqt3',
        clientSecret: '7Fjfp0ZBr1KtDRbnfVdmIw'
      })
      const x = await authorizer.authorize({ loginHint: 'janedoe@example.com', scope: [ 'openid' ] })
      expect(fetch).toHaveBeenCalledWith('http://example.test/bc-authorize', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic czZCaGRSa3F0Mzo3RmpmcDBaQnIxS3REUmJuZlZkbUl3',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'login_hint=janedoe%40example.com&scope=openid'
      });
      expect(x).toEqual('G5kXH2wHvUra0sHlDy1iTkDJgsgUO1bN')
    }) // should authenticate using HTTP basic scheme
    
  }) // #authorize
  
})
