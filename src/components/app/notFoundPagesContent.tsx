'use client'
import { Button } from '@/components/ui/button'
import { MaybeNextImg } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { useCallback } from 'react'

export function NotFoundPagesContent() {
  const onPress = useCallback(() => {
    trackClientAnalytic('NotFoundPagesContent Go home Pressed', {
      component: AnalyticComponentType.button,
      action: AnalyticActionType.click,
    })
  }, [])
  return (
    <div className="container flex flex-grow flex-col items-center justify-center space-y-7">
      <MaybeNextImg src="/error_shield.svg" width={120} height={120} alt="" />
      <PageTitle size="sm">Page not found.</PageTitle>
      <Button className="mr-3" asChild onClick={onPress}>
        <InternalLink href="/">Go home</InternalLink>
      </Button>
    </div>
  )
}
