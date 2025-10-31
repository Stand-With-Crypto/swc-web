import { defineConfig, globalIgnores } from 'eslint/config'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import formatjs from 'eslint-plugin-formatjs'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import nextPlugin from '@next/eslint-plugin-next'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import storybookPlugin from 'eslint-plugin-storybook'

const sortImports = {
  groups: [
    ['^\\u0000'],
    ['^react$', '^react-native$', '^react', '^@?\\w'],
    ['^:.*'],
    [
      '^@/(actions|app|bin|clientModels|components|data|hooks|inngest|intl|mocks|pages|staticContent|types|utils|validation)(/.*)?',
    ],
    ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
    ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
  ],
}

export default defineConfig(
  [
    {
      files: ['**/*.{ts,tsx}'],
      ignores: ['.storybook/**/*.{ts,tsx}'],
      plugins: {
        '@typescript-eslint': typescriptEslint,
        '@next/next': nextPlugin,
        react: reactPlugin,
        'react-hooks': reactHooksPlugin,
        import: importPlugin,
        'no-relative-import-paths': noRelativeImportPaths,
        formatjs,
        'simple-import-sort': simpleImportSort,
      },

      languageOptions: {
        parser: typescriptParser,
        parserOptions: {
          project: './tsconfig.json',
          tsconfigRootDir: import.meta.dirname,
        },
      },

      rules: {
        ...typescriptEslint.configs.recommended.rules,
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs['core-web-vitals'].rules,
        ...reactPlugin.configs.recommended.rules,

        // UPGRADE TO NEXTJS 16: These are disabled because new versions of these rules are more strict and would require a lot of changes on the codebase.
        'react/prop-types': 'off',
        'react-hooks/set-state-in-effect': 'off',
        'react-hooks/immutability': 'off',
        'react/no-unknown-property': 'off',
        /***********/

        eqeqeq: ['error', 'always'],
        'formatjs/enforce-description': ['error', 'literal'],
        'formatjs/no-offset': 'error',
        'formatjs/enforce-default-message': ['error', 'literal'],

        '@typescript-eslint/no-shadow': [
          'error',
          {
            ignoreOnInitialization: true,
          },
        ],

        '@typescript-eslint/restrict-template-expressions': [
          'error',
          {
            allowAny: true,
            allowNumber: true,
            allowBoolean: false,
            allowNullish: false,
          },
        ],

        'no-empty': [
          'error',
          {
            allowEmptyCatch: true,
          },
        ],

        'react/jsx-sort-props': 'warn',
        'react/no-unescaped-entities': 'off',
        'react/react-in-jsx-scope': 'off',
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

        'no-relative-import-paths/no-relative-import-paths': [
          'error',
          {
            allowSameFolder: true,
          },
        ],

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

        'react-hooks/exhaustive-deps': [
          'warn',
          {
            additionalHooks: 'useLoadingCallback',
          },
        ],

        'simple-import-sort/imports': ['warn', sortImports],
        'simple-import-sort/exports': 'warn',
        'import/first': 'warn',
        'import/newline-after-import': 'warn',
        curly: ['error', 'multi-line'],
        'import/no-duplicates': 'error',

        'import/no-restricted-paths': [
          'error',
          {
            zones: [
              {
                target: './cypress',
                from: './src',
              },
            ],
          },
        ],

        'react/no-unstable-nested-components': [
          'error',
          {
            allowAsProps: true,
          },
        ],

        '@typescript-eslint/consistent-type-definitions': 'error',
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
  ],
  globalIgnores([
    '**/**/*.generated.ts',
    '**/*.js',
    '**/generated/**/*',
    '.next/**',
    'node_modules/**',
    'src/data/dtsi/generated.ts',
    'src/data/dtsi/introspection.json',
    '.storybook/**',
  ]),
)
