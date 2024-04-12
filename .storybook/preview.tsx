import type { Preview } from '@storybook/react'
import React from 'react'
import '../src/globals.css'
import { openSansFont, satoshiFont } from '../src/utils/web/fonts'

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
      <div className={openSansFont.className}>
        {/* TODO get this
        <div className={satoshiFont.className}> */}
        <Story />
        {/* </div> */}
      </div>
    ),
  ],
}

export default preview
