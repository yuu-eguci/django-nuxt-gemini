import type { NuxtConfig } from '@nuxt/types'

// NOTE: nuxt.config.ts はモジュールの読み込み時に env を読むので、毎回読み込み直します。
const loadConfig = async (): Promise<NuxtConfig> => {
  let config: NuxtConfig = {}
  await jest.isolateModulesAsync(async () => {
    config = (await import('@/nuxt.config')).default
  })
  return config
}

describe('nuxt.config.ts', () => {
  const originalApiUrl = process.env.API_URL

  afterEach(() => {
    if (originalApiUrl === undefined) {
      delete process.env.API_URL
    } else {
      process.env.API_URL = originalApiUrl
    }
  })

  test('API_URL を axios の baseURL に使います', async () => {
    process.env.API_URL = '/'
    expect((await loadConfig()).axios?.baseURL).toBe('/')
  })

  test('API_URL がないときは開発用の Django (8001) を使います', async () => {
    delete process.env.API_URL
    expect((await loadConfig()).axios?.baseURL).toBe('http://localhost:8001/')
  })
})
