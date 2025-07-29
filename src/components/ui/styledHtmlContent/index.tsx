import { HTMLAttributes } from 'react'
import sanitizeHtml from 'sanitize-html'

import { INTERNAL_BASE_URL } from '@/utils/shared/urls'
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
  attribs.class = cn(attribs.class, 'ml-4 p-0 flex flex-col gap-2')

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

export function StyledHtmlContent({
  html,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { html: string }) {
  return (
    <div
      {...props}
      className={cn('prose max-w-full break-words', className)}
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(html, {
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
    />
  )
}
