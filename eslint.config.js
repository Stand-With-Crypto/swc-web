import typescriptEslint from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'

// Basic ESLint 9 flat config for Next.js with TypeScript
export default [
  {
    ignores: [
      '**/**/*.generated.ts',
      '*.js',
      '**/generated/**',
      '.next/**',
      'node_modules/**',
      '.storybook/**',
      'public/**',
      'cypress/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Basic rules from the original config
      'eqeqeq': ['error', 'always'],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'curly': ['error', 'multi-line'],
    },
  },
  // TypeScript-specific config (only for files in tsconfig)
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Basic rules from the original config
      'eqeqeq': ['error', 'always'],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'curly': ['error', 'multi-line'],
    },
  },
]