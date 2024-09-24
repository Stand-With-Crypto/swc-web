'use client'
import React from 'react'

import { InternalLink } from '@/components/ui/link'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import { trackInternalLink } from '@/utils/web/clientAnalytics'

export const TrackedInternalLink = React.forwardRef<
  React.ElementRef<typeof InternalLink>,
  React.ComponentPropsWithoutRef<typeof InternalLink> & { eventProperties?: AnalyticProperties }
>(({ eventProperties, ...props }, ref) => {
  const onClick = React.useCallback(() => {
    trackInternalLink(eventProperties)
  }, [eventProperties])
  return <InternalLink onClick={onClick} ref={ref} {...props} />
})
TrackedInternalLink.displayName = 'TrackedInternalLink'
