'use client'
import { ExternalLink } from '@/components/ui/link'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import { trackExternalLink } from '@/utils/web/clientAnalytics'
import React from 'react'

export const TrackedExternalLink = React.forwardRef<
  React.ElementRef<typeof ExternalLink>,
  React.ComponentPropsWithoutRef<typeof ExternalLink> & { eventProperties?: AnalyticProperties }
>(({ eventProperties, ...props }, ref) => {
  const onClick = React.useCallback(() => {
    trackExternalLink(eventProperties)
  }, [eventProperties])
  return <ExternalLink onClick={onClick} ref={ref} {...props} />
})
TrackedExternalLink.displayName = 'TrackedExternalLink'
