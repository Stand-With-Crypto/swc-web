import { Builder } from '@builder.io/react'

import type { BuilderComponentBaseProps } from '@/utils/web/builder'
import { BuilderComponentAttributes } from '@/utils/web/builder/types'

interface TextProps {
  text: string
}

function Text(props: TextProps & BuilderComponentAttributes) {
  return <div {...props}>{props.text}</div>
}

type BuilderTextProps = BuilderComponentBaseProps & TextProps

Builder.registerComponent(
  ({ text, attributes }: BuilderTextProps) => (
    <Text text={text} {...attributes} key={attributes?.key} />
  ),
  {
    name: 'Text',
    override: true,
    noWrap: true, // Disables the default "Link URL" field
    inputs: [
      {
        name: 'text',
        type: 'string',
        required: true,
        defaultValue: 'Enter some text...',
      },
    ],
  },
)
