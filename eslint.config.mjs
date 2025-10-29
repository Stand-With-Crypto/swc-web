import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import formatjsPlugin from 'eslint-plugin-formatjs'
import importPlugin from 'eslint-plugin-import'
import noRelativeImportPathsPlugin from 'eslint-plugin-no-relative-import-paths'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort'
import storybookPlugin from 'eslint-plugin-storybook'

const sortImports = {
  groups: [
    // Side effect imports first i.e. import "some-polyfill";
    ['^\\u0000'],
    // React, react-native, react prefixed imports, all other 3rd party imports
    ['^react$', '^react-native$', '^react', '^@?\\w'],
    // Shared code imports
    ['^:.*'],
    // Root level and App specific imports
    [
      '^@/(actions|app|bin|clientModels|components|data|hooks|inngest|intl|mocks|pages|staticContent|types|utils|validation)(/.*)?',
    ],
    // Parent imports. Put `..` last.
    ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
    // Other relative imports. Put same-folder imports and `.` last.
    ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
  ],
}

export default [
  {
    ignores: [
      '**/**/*.generated.ts',
      '*.js',
      '**/generated/**',
      'node_modules/**',
      'src/data/dtsi/generated.ts',
      'src/data/dtsi/introspection.json',
    ],
  },

  js.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      formatjs: formatjsPlugin,
      import: importPlugin,
      'no-relative-import-paths': noRelativeImportPathsPlugin,
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSortPlugin,
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-empty': ['error', { allowEmptyCatch: true }],
      curly: ['error', 'multi-line'],

      ...typescriptEslint.configs.recommended.rules,
      '@typescript-eslint/no-shadow': ['error', { ignoreOnInitialization: true }],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowAny: true, allowNumber: true, allowBoolean: false, allowNullish: false },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/consistent-type-definitions': 'error',

      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,

      'formatjs/enforce-description': ['error', 'literal'],
      'formatjs/no-offset': 'error',
      'formatjs/enforce-default-message': ['error', 'literal'],

      'react/jsx-sort-props': 'warn',
      'react/no-unescaped-entities': 'off',
      'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: 'useLoadingCallback',
        },
      ],

      'no-relative-import-paths/no-relative-import-paths': ['error', { allowSameFolder: true }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lodash',
              message: 'Please use lodash-es instead.',
            },
            {
              name: 'react-use',
              importNames: ['useEffectOnce'],
              message: 'Please use the version of this hook defined in `@/hooks`',
            },
          ],
        },
      ],
      'simple-import-sort/imports': ['warn', sortImports],
      'simple-import-sort/exports': 'warn',
      'import/first': 'warn',
      'import/newline-after-import': 'warn',
      'import/no-duplicates': 'error',
      'import/no-restricted-paths': [
        'error',
        {
          zones: [{ target: './cypress', from: './src' }],
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  {
    files: ['**/*.stories.{ts,tsx}'],
    plugins: {
      storybook: storybookPlugin,
    },
    rules: {
      ...storybookPlugin.configs.recommended.rules,
    },
  },
]
