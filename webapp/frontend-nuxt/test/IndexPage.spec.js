import { shallowMount } from '@vue/test-utils'
import IndexPage from '@/pages/index.vue'

describe('IndexPage', () => {
  test('Django の foo API を呼び出します', async () => {
    const $axios = { get: jest.fn().mockResolvedValue({ data: {} }) }
    jest.spyOn(console, 'info').mockImplementation(() => {})

    shallowMount(IndexPage, {
      mocks: { $axios },
      stubs: ['v-row', 'v-col', 'v-card', 'v-card-title', 'v-card-text', 'v-card-actions', 'v-spacer', 'v-btn']
    })
    await Promise.resolve()

    expect($axios.get).toHaveBeenCalledWith('api/app/foo')
  })
})
