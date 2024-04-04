'use client'

import React, { Suspense, useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { BACK_URL_PARAM } from '@/components/ui/conditionalSearchParamGoBack/backUrlUtils'
import { InternalLink } from '@/components/ui/link'
import { base64Encode } from '@/utils/shared/base64'
import { fullUrl } from '@/utils/shared/urls'

export const _InternalLinkWihSearchParamGoBack = React.forwardRef<
  HTMLAnchorElement,
  Omit<React.ComponentProps<typeof InternalLink>, 'href'> & { href: string }
>(({ href, ...props }, ref) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const computedHref = useMemo(() => {
    if (!pathname || !searchParams) {
      return href
    }
    const backUrl = `${pathname}?${searchParams.toString()}`

    const newUrl = new URL(fullUrl(href))
    const newSearchParams = new URLSearchParams(newUrl.search)
    newSearchParams.append(BACK_URL_PARAM, base64Encode(backUrl))
    newUrl.search = decodeURIComponent(newSearchParams.toString())

    return `${newUrl.pathname}${newUrl.search}`
  }, [pathname, searchParams, href])
  return <InternalLink href={computedHref} ref={ref} {...props} />
})

_InternalLinkWihSearchParamGoBack.displayName = '_InternalLinkWihSearchParamGoBack'

export const InternalLinkWihSearchParamGoBack = React.forwardRef<
  HTMLAnchorElement,
  Omit<React.ComponentProps<typeof InternalLink>, 'href'> & { href: string }
>((props, ref) => {
  return (
    <Suspense fallback={<InternalLink ref={ref} {...props} />}>
      <_InternalLinkWihSearchParamGoBack ref={ref} {...props} />
    </Suspense>
  )
})

InternalLinkWihSearchParamGoBack.displayName = '_InternalLinkWihSearchParamGoBack'
