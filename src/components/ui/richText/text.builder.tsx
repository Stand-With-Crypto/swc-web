import { Builder } from '@builder.io/react'

import { BuilderComponentBaseProps } from '@/utils/web/builder'

import { RichText } from '.'

interface BuilderTextProps extends BuilderComponentBaseProps {
  text: string
}

Builder.registerComponent(
  ({ text, attributes }: BuilderTextProps) => (
    // Replace text-indent with margin-left because Builder.io applies text-indent to nested lists and
    // RichText uses tailwind typography prose class which doesn't apply text-ident to the ::marker pseudo-element
    // So we need to use margin-left instead
    <RichText content={text.replaceAll('text-indent', 'margin-left')} {...attributes} />
  ),
  {
    name: 'Text',
    override: true,
    inputs: [
      {
        name: 'text',
        type: 'richText',
      },
    ],
  },
)
