/* eslint-env node */
const sortImports = {
  groups: [
    // Side effect imports first i.e. import "some-polyfill";
    ['^\\u0000'],
    // React, react-native, react prefixed imports, all other 3rd party imports
    ['^react$', '^react-native$', '^react', '^@?\\w'],
    // Shared code imports
    ['^:.*'],
    // Design system
    ['^@designSystem.*'],
    // Root level and App specifc imports
    [
      '^@/(actions|app|bin|clientModels|components|data|hooks|inngest|intl|mocks|pages|staticContent|types|utils|validation)(/.*)',
    ],
    // Parent imports. Put `..` last.
    ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
    // Other relative imports. Put same-folder imports and `.` last.
    ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
  ],
}

module.exports = {
  root: true,
  ignorePatterns: ['**/**/*.generated.ts', '*.js'],
  extends: [
    'next',
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:storybook/recommended',
  ],
  plugins: ['no-relative-import-paths', 'formatjs', 'simple-import-sort'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    eqeqeq: ['error', 'always'],
    'formatjs/enforce-description': ['error', 'literal'],
    'formatjs/no-offset': 'error',
    'formatjs/enforce-default-message': ['error', 'literal'],
    '@typescript-eslint/no-shadow': ['error', { ignoreOnInitialization: true }],
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowAny: true, allowNumber: true, allowBoolean: false, allowNullish: false },
    ],
    'no-empty': ['error', { allowEmptyCatch: true }],
    'react/jsx-sort-props': 'error',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-namespace': 'off',
    'no-relative-import-paths/no-relative-import-paths': ['error', { allowSameFolder: true }],
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: 'useLoadingCallback',
      },
    ],
    'simple-import-sort/imports': ['error', sortImports],
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
  },
}
