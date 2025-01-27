import { Builder } from '@builder.io/react'

import { openSansFont, satoshiFont } from '@/utils/web/fonts'

Builder.register('editor.settings', {
  designTokens: {
    fontFamily: [
      { name: 'Satoshi', value: satoshiFont.style.fontFamily },
      { name: 'Open Sans', value: openSansFont.style.fontFamily },
    ],
  },
})
