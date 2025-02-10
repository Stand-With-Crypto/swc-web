/* eslint-env node */
module.exports = {
  root: true,
  ignorePatterns: ['**/**/*.generated.ts', '*.js', '**/src/*'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:cypress/recommended',
  ],
  env: {
    'cypress/globals': true,
  },
  plugins: ['no-relative-import-paths', 'formatjs', 'cypress'],
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
    'import/first': 'warn',
    'import/newline-after-import': 'warn',
    curly: ['error', 'multi-line'],
    'import/no-duplicates': 'error',
    'no-relative-import-paths/no-relative-import-paths': ['error', { allowSameFolder: true }],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/*', '**/src/*'],
            message: 'Please do not import outside Cypress environment.',
          },
        ],
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    'cypress/no-unnecessary-waiting': 'off',
    'cypress/unsafe-to-chain-command': 'off',
  },
}
