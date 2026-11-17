import { shallowMount } from '@vue/test-utils'
import ErrorLayout from '@/layouts/error.vue'

const mountErrorLayout = (statusCode: number) => shallowMount(ErrorLayout, {
  propsData: { error: { statusCode } },
  stubs: ['v-app', 'NuxtLink']
})

describe('ErrorLayout', () => {
  test('404 のときは 404 Not Found を表示します', () => {
    expect(mountErrorLayout(404).find('h1').text()).toBe('404 Not Found')
  })

  test('404 以外のときは An error occurred を表示します', () => {
    expect(mountErrorLayout(500).find('h1').text()).toBe('An error occurred')
  })
})
