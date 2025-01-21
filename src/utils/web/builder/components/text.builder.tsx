import { Builder } from '@builder.io/react'

import type { BuilderComponentBaseProps } from '@/utils/web/builder'
import { sanitizeBuilderAttributes } from '@/utils/web/builder/sanitizeBuilderAttributes'

interface TextProps {
  text: string
}

function Text(props: TextProps) {
  return <div {...props}>{props.text}</div>
}

type BuilderTextProps = BuilderComponentBaseProps & TextProps

Builder.registerComponent(
  ({ text, attributes }: BuilderTextProps) => (
    <Text text={text} {...sanitizeBuilderAttributes(attributes)} />
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
