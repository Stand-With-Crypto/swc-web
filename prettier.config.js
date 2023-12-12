module.exports = {
  bracketSpacing: true,
  useTabs: false,
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  arrowParens: 'avoid',
  plugins: ['prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.raw.ts',
      options: {
        printWidth: 2000,
      },
    },
  ],
}
