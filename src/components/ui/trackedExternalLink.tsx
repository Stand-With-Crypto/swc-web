'use client'
import React from 'react'

import { ExternalLink } from '@/components/ui/link'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import { trackExternalLink } from '@/utils/web/clientAnalytics'

export const TrackedExternalLink = React.forwardRef<
  React.ComponentRef<typeof ExternalLink>,
  React.ComponentPropsWithoutRef<typeof ExternalLink> & { eventProperties?: AnalyticProperties }
>(({ eventProperties, ...props }, ref) => {
  const onClick = React.useCallback(() => {
    trackExternalLink(eventProperties)
  }, [eventProperties])
  return <ExternalLink onClick={onClick} ref={ref} {...props} />
})
TrackedExternalLink.displayName = 'TrackedExternalLink'
