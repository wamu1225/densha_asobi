import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // 日本語UIの意図的な全角スペース（見出しの字下げ・フレーズ区切り）を許可
      'no-irregular-whitespace': ['error', { skipJSXText: true, skipTemplates: true, skipStrings: true }],
      // eslint-plugin-react-hooks v7 の新ルール。イベントハンドラ内の Math.random や
      // 状態変化時の load-on-change（setState in effect）など、正常動作する意図的パターンに
      // 誤検出が多いため助言（warn）に降格。機械的な実エラーは個別に修正済み
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
