import { defineConfig, globalIgnores } from 'eslint/config'
import pluginJest from 'eslint-plugin-jest'
import pluginVue from 'eslint-plugin-vue'
import neostandard from 'neostandard'
import tseslint from 'typescript-eslint'

// NOTE: 以前の @nuxtjs/eslint-config-typescript (standard + typescript-eslint + vue/recommended) に相当する設定です。
//       Nuxt 2 / ESLint 8 向けの設定がメンテナンスされなくなったので、後継の neostandard を使っています。
export default defineConfig(
  globalIgnores(['.nuxt/', 'dist/', 'coverage/']),
  // NOTE: neostandard は既定では .vue を対象にしないので、 filesTs で .vue の <script lang="ts"> にも適用します。
  neostandard({ ts: true, filesTs: ['**/*.vue'] }),
  tseslint.configs.recommended,
  pluginVue.configs['flat/vue2-recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser }
    }
  },
  {
    rules: {
      // NOTE: @nuxtjs/eslint-config と同じく、 console は警告、 Nuxt の pages / layouts の 1 単語名は許可します。
      'no-console': 'warn',
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    files: ['test/**/*.ts'],
    extends: [pluginJest.configs['flat/recommended']]
  }
)
