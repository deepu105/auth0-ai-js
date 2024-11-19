import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Auth0CIBAAuthorizer } from '../../../src/ciba/auth0/polling-authorizer'

describe('Auth0CIBAAuthorizer#authorize', () => {
  
  it('should send request to url', async () => {
    vi.stubGlobal('fetch', vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () => {
          return Promise.resolve({ auth_req_id: '1c266114-a1be-4252-8ad1-04986c5b9ac1' });
        }
      })
    }))
    
    const authorizer = new Auth0CIBAAuthorizer('https://example.auth0.com/bc-authorize')
    
    const x = await authorizer.authorize({ acrValues: [ 'myACR' ], scope: [ 'purchase' ] })
    expect(fetch).toHaveBeenCalledWith('https://example.auth0.com/bc-authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'acr_values=myACR&scope=purchase&binding_message=IGNORE'
    });
    expect(x).toEqual('1c266114-a1be-4252-8ad1-04986c5b9ac1')
  }) // should send request to url
  
  it('should send request to domain', async () => {
    vi.stubGlobal('fetch', vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () => {
          return Promise.resolve({ auth_req_id: '1c266114-a1be-4252-8ad1-04986c5b9ac1' });
        }
      })
    }))
    
    const authorizer = new Auth0CIBAAuthorizer('example.auth0.com')
    
    const x = await authorizer.authorize({ acrValues: [ 'myACR' ], scope: [ 'purchase' ] })
    expect(fetch).toHaveBeenCalledWith('https://example.auth0.com/bc-authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'acr_values=myACR&scope=purchase&binding_message=IGNORE'
    });
    expect(x).toEqual('1c266114-a1be-4252-8ad1-04986c5b9ac1')
  }) // should send request to domain
  
  it('should send request to url passed as option', async () => {
    vi.stubGlobal('fetch', vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () => {
          return Promise.resolve({ auth_req_id: '1c266114-a1be-4252-8ad1-04986c5b9ac1' });
        }
      })
    }))
    
    const authorizer = new Auth0CIBAAuthorizer({ url: 'https://example.auth0.com/bc-authorize',  clientID: 's6BhdRkqt3', clientSecret: '7Fjfp0ZBr1KtDRbnfVdmIw' })
    
    const x = await authorizer.authorize({ acrValues: [ 'myACR' ], scope: [ 'purchase' ] })
    expect(fetch).toHaveBeenCalledWith('https://example.auth0.com/bc-authorize', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic czZCaGRSa3F0Mzo3RmpmcDBaQnIxS3REUmJuZlZkbUl3',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'acr_values=myACR&scope=purchase&binding_message=IGNORE'
    });
    expect(x).toEqual('1c266114-a1be-4252-8ad1-04986c5b9ac1')
  }) // should send request to url passed as option
  
  it('should send request to domain passed as option', async () => {
    vi.stubGlobal('fetch', vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () => {
          return Promise.resolve({ auth_req_id: '1c266114-a1be-4252-8ad1-04986c5b9ac1' });
        }
      })
    }))
    
    const authorizer = new Auth0CIBAAuthorizer({ domain: 'example.auth0.com',  clientID: 's6BhdRkqt3', clientSecret: '7Fjfp0ZBr1KtDRbnfVdmIw' })
    
    const x = await authorizer.authorize({ acrValues: [ 'myACR' ], scope: [ 'purchase' ] })
    expect(fetch).toHaveBeenCalledWith('https://example.auth0.com/bc-authorize', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic czZCaGRSa3F0Mzo3RmpmcDBaQnIxS3REUmJuZlZkbUl3',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'acr_values=myACR&scope=purchase&binding_message=IGNORE'
    });
    expect(x).toEqual('1c266114-a1be-4252-8ad1-04986c5b9ac1')
  }) // should send request to domain passed as option
  
})
