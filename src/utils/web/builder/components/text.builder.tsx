import { Builder } from '@builder.io/react'
import sanitizeHtml from 'sanitize-html'

import { INTERNAL_BASE_URL } from '@/utils/shared/urls'
import { BuilderComponentBaseProps } from '@/utils/web/builder'
import { cn } from '@/utils/web/cn'

function transformLi(tagName: string, attribs: Record<string, string>) {
  if (attribs.style && attribs.style.includes('text-indent')) {
    // Replace text-indent with margin-left because Builder.io applies text-indent to nested lists and
    // RichText uses tailwind typography prose class which doesn't apply text-ident to the ::marker pseudo-element
    // So we need to use margin-left instead
    attribs.style = attribs.style.replace('text-indent', 'margin-left')
  }

  attribs.class = cn(attribs.class, 'm-0 p-0')

  return { tagName, attribs }
}

function transformOlAndUl(tagName: string, attribs: Record<string, string>) {
  attribs.class = cn(attribs.class, 'ml-4 p-0')

  return { tagName, attribs }
}

function transformLink(tagName: string, attribs: Record<string, string>) {
  if (
    attribs.href?.startsWith(INTERNAL_BASE_URL) ||
    attribs.href?.startsWith('/') ||
    attribs.href?.startsWith('#')
  ) {
    attribs.target = '_self'
  } else {
    attribs.target = '_blank'
  }

  return { tagName, attribs }
}

interface BuilderTextProps extends BuilderComponentBaseProps {
  text: string
  style?: React.CSSProperties
}

Builder.registerComponent(
  ({ text, attributes, style }: BuilderTextProps) => (
    <div
      {...attributes}
      style={{
        ...attributes?.style,
        ...style,
      }}
      className={cn('prose max-w-full break-words', attributes?.className)}
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(text, {
          allowedAttributes: {
            '*': ['style', 'class'],
            a: ['href', 'target'],
          },
          transformTags: {
            li: transformLi,
            ul: transformOlAndUl,
            ol: transformOlAndUl,
            a: transformLink,
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
