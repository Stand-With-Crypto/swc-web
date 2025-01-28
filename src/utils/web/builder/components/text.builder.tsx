import { Builder } from '@builder.io/react'
import sanitizeHtml from 'sanitize-html'

import { BuilderComponentBaseProps } from '@/utils/web/builder'
import { BuilderComponentAttributes } from '@/utils/web/builder/types'
import { cn } from '@/utils/web/cn'

interface TextProps {
  text: string
}

function transformLi(tagName: string, attribs: Record<string, string>) {
  if (attribs.style && attribs.style.includes('text-indent')) {
    attribs.style = attribs.style.replace('text-indent', 'margin-left')
  }
  return { tagName, attribs }
}

function Text(props: TextProps & BuilderComponentAttributes) {
  return (
    <div
      {...props}
      className={cn('prose max-w-full', props.className)}
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(props.text, {
          allowedAttributes: {
            '*': ['style', 'class'],
            a: ['href'],
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
  ({ text, attributes }: BuilderTextProps) => (
    // Replace text-indent with margin-left because Builder.io applies text-indent to nested lists and
    // RichText uses tailwind typography prose class which doesn't apply text-ident to the ::marker pseudo-element
    // So we need to use margin-left instead
    <Text {...attributes} key={attributes?.key} text={text} />
  ),
  {
    name: 'Text',
    override: true,
    noWrap: true, // Disables the default "Link URL" field
    inputs: [
      {
        name: 'text',
        type: 'richText',
        required: true,
        defaultValue: 'Enter some text...',
      },
    ],
  },
)
