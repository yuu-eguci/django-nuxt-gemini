const loadConfig = () => {
  let config
  jest.isolateModules(() => {
    config = require('@/nuxt.config.js').default
  })
  return config
}

describe('nuxt.config.js', () => {
  const originalApiUrl = process.env.API_URL

  afterEach(() => {
    if (originalApiUrl === undefined) {
      delete process.env.API_URL
    } else {
      process.env.API_URL = originalApiUrl
    }
  })

  test('API_URL を axios の baseURL に使います', () => {
    process.env.API_URL = '/'
    expect(loadConfig().axios.baseURL).toBe('/')
  })

  test('API_URL がないときは開発用の Django (8001) を使います', () => {
    delete process.env.API_URL
    expect(loadConfig().axios.baseURL).toBe('http://localhost:8001/')
  })
})
