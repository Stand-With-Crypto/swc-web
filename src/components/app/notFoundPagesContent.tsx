'use client'

import { useCallback, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { MaybeNextImg } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'

export function NotFoundPagesContent() {
  const pathname = usePathname()
  const urls = useIntlUrls()

  const onPress = useCallback(() => {
    trackClientAnalytic('NotFoundPagesContent Go home Pressed', {
      component: AnalyticComponentType.button,
      action: AnalyticActionType.click,
    })
  }, [])

  useEffect(() => {
    Sentry.captureMessage(`404 page rendered`, { tags: { pathname } })
  }, [pathname])

  return (
    <div className="standard-spacing-from-navbar container mt-24 flex flex-grow flex-col items-center justify-center space-y-7">
      <MaybeNextImg alt="" height={120} src="/error_shield.svg" width={120} />
      <PageTitle size="sm">Page not found.</PageTitle>
      <Button asChild className="mr-3" onClick={onPress}>
        <InternalLink href={urls.home()}>Go home</InternalLink>
      </Button>
    </div>
  )
}
