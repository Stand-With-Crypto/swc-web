import type { Preview } from '@storybook/react'
import { fontClassName } from '../src/utils/web/fonts'
import '../src/globals.css'
import React from 'react'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    Story => (
      <div className={fontClassName}>
        <Story />
      </div>
    ),
  ],
}

export default preview
