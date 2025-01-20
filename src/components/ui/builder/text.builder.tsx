import { Builder } from '@builder.io/react'
import sanitizeHtml from 'sanitize-html'

import { BuilderComponentBaseProps } from '@/utils/web/builder'

interface TextProps {
  text: string
}

function transformLi(tagName: string, attribs: Record<string, string>) {
  if (attribs.style && attribs.style.includes('text-indent')) {
    attribs.style = attribs.style.replace('text-indent', 'margin-left')
  }
  return { tagName, attribs }
}

function Text(props: TextProps) {
  return (
    <div
      className="prose max-w-full"
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(props.text, {
          allowedTags: sanitizeHtml.defaults.allowedTags,
          allowedAttributes: {
            '*': ['style', 'class'],
          },
          transformTags: {
            li: transformLi,
          },
        }),
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
