import { Builder } from '@builder.io/react'
import sanitizeHtml from 'sanitize-html'

import { BuilderComponentBaseProps } from '@/utils/web/builder'
import { cn } from '@/utils/web/cn'

function transformLi(tagName: string, attribs: Record<string, string>) {
  if (attribs.style && attribs.style.includes('text-indent')) {
    // Replace text-indent with margin-left because Builder.io applies text-indent to nested lists and
    // RichText uses tailwind typography prose class which doesn't apply text-ident to the ::marker pseudo-element
    // So we need to use margin-left instead
    attribs.style = attribs.style.replace('text-indent', 'margin-left')
  }

  attribs.style = 'margin:0px;padding:0px;'

  return { tagName, attribs }
}

function transformOlAndUl(tagName: string, attribs: Record<string, string>) {
  attribs.style = 'margin-left:1rem;padding:0;'

  return { tagName, attribs }
}

interface BuilderTextProps extends BuilderComponentBaseProps {
  text: string
}

Builder.registerComponent(
  ({ text, attributes }: BuilderTextProps) => (
    <div
      {...attributes}
      className={cn('prose max-w-full break-words', attributes?.className)}
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(text, {
          allowedAttributes: {
            '*': ['style', 'class'],
            a: ['href'],
          },
          transformTags: {
            li: transformLi,
            ul: transformOlAndUl,
            ol: transformOlAndUl,
          },
        }),
      }}
      key={attributes?.key}
    />
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
