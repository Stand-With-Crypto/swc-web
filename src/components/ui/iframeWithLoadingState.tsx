'use client'

import React, { IframeHTMLAttributes } from 'react'

import { LoadingOverlay } from '@/components/ui/loadingOverlay'

export function IFrameWithLoadingState(
  props: React.DetailedHTMLProps<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>,
) {
  const [hasLoaded, setHasLoaded] = React.useState(false)
  console.log({ hasLoaded })
  return (
    <div className="relative">
      {hasLoaded || <LoadingOverlay />}
      <iframe {...props} onLoad={() => setHasLoaded(true)} />
    </div>
  )
}
