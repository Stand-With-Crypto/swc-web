import { Builder } from '@builder.io/react'
import sanitizeHtml from 'sanitize-html'

import { BuilderComponentBaseProps } from '@/utils/web/builder'

interface TextProps {
  text: string
}

function Text(props: TextProps) {
  return (
    <div
      className="prose max-w-full"
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(props.text),
      }}
    />
  )
}

interface BuilderTextProps extends BuilderComponentBaseProps {
  text: string
}

Builder.registerComponent(
  ({ text, attributes }: BuilderTextProps) => {
    return <Text text={text} {...attributes} />
  },
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
