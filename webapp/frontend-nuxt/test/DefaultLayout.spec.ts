import { shallowMount } from '@vue/test-utils'
import DefaultLayout from '@/layouts/default.vue'

describe('DefaultLayout', () => {
  test('ナビゲーションに Welcome (/) と Inspire (/inspire) を表示します', () => {
    const wrapper = shallowMount(DefaultLayout, {
      stubs: [
        'Nuxt', 'v-app', 'v-navigation-drawer', 'v-list', 'v-list-item', 'v-list-item-action', 'v-list-item-content',
        'v-list-item-title', 'v-icon', 'v-app-bar', 'v-app-bar-nav-icon', 'v-btn', 'v-toolbar-title', 'v-spacer',
        'v-main', 'v-container', 'v-footer'
      ]
    })

    const items = wrapper.findAll('v-list-item-stub').filter(item => item.attributes('to') !== undefined)
    expect(items.wrappers.map(item => [item.text(), item.attributes('to')])).toEqual([
      ['mdi-apps Welcome', '/'],
      ['mdi-chart-bubble Inspire', '/inspire']
    ])
  })
})
