'use client'
import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { BACK_URL_PARAM } from '@/components/ui/conditionalSearchParamGoBack/backUrlUtils'
import { InternalLink } from '@/components/ui/link'
import { base64Decode } from '@/utils/shared/base64'
import { cn } from '@/utils/web/cn'

export function GoBack({ url }: { url: string }) {
  return (
    <InternalLink
      className="inline-flex items-center gap-2 text-sm font-bold text-fontcolor"
      href={url}
    >
      <ArrowLeft className="h-5 w-5" /> <div>Go back</div>
    </InternalLink>
  )
}

function SuspenseConditionalSearchParamGoBack({ className }: { className?: string }) {
  const params = useSearchParams()
  const backUrl = params?.get(BACK_URL_PARAM)
  if (!backUrl) {
    return null
  }
  // the overall page has a mt-10 default spacing between navbar and content. We don't
  // want additional jank that shifts content when this needs to render so we position it to not take up any space
  return (
    <div className={cn('absolute top-[-30px] w-full', className)}>
      <GoBack url={decodeURIComponent(base64Decode(backUrl))} />
    </div>
  )
}

export function ConditionalSearchParamGoBack(props: { className?: string }) {
  return (
    <Suspense>
      <SuspenseConditionalSearchParamGoBack {...props} />
    </Suspense>
  )
}
