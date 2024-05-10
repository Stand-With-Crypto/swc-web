'use client'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { MaybeNextImg } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'

export function ErrorPagesContent({ reset }: { reset: () => void }) {
  const onPress = useCallback(() => {
    trackClientAnalytic('ErrorPagesContent Try Again Pressed', {
      component: AnalyticComponentType.button,
      action: AnalyticActionType.click,
    })
    reset()
  }, [reset])
  return (
    <div className="standard-spacing-from-navbar container flex flex-grow flex-col items-center justify-center space-y-7">
      <MaybeNextImg alt="" height={120} src="/error_shield.svg" width={120} />
      <PageTitle size="sm">Something went wrong.</PageTitle>
      <Button className="mr-3" onClick={onPress}>
        Try again
      </Button>
    </div>
  )
}
