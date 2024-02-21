import type { StorybookConfig } from '@storybook/nextjs'
import path from 'path'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-styling-webpack',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
  },
  // https://storybook.js.org/docs/builders/webpack#:~:text=However%2C%20if%20you%27re%20working%20with%20a%20framework
  webpackFinal: async config => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'server-only': path.resolve(__dirname, '../node_modules/server-only/empty.js'),
        '@/utils/server/obscenityMatcher': path.resolve(__dirname, './mockObscenityMatcher.ts'),
        '@/actions/actionCreateUserActionTweet': path.resolve(__dirname, './serverActionMocks.ts'),
        '@/actions/actionCreateUserActionNFTMint': path.resolve(
          __dirname,
          './serverActionMocks.ts',
        ),
        '@/actions/actionCreateUserActionCallCongressperson': path.resolve(
          __dirname,
          './serverActionMocks.ts',
        ),
        '@/actions/actionCreateUserActionEmailCongressperson': path.resolve(
          __dirname,
          './serverActionMocks.ts',
        ),
        '@/actions/actionUpdateUserHasOptedInToMembership': path.resolve(
          __dirname,
          './serverActionMocks.ts',
        ),
        '@': path.resolve(__dirname, '../src'),
      }
    }
    return config
  },
}
export default config
