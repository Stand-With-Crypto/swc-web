import { Button } from '@/components/ui/button'
import { MaybeNextImg } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { useCallback } from 'react'

export function ErrorPagesContent({ reset }: { reset: () => void }) {
  const onPress = useCallback(() => {
    trackClientAnalytic('Error Page Try Again Pressed')
    reset()
  }, [])
  return (
    <div className="container flex flex-grow flex-col items-center justify-center space-y-7">
      <MaybeNextImg src="/error_shield.svg" width={120} height={120} alt="" />
      <PageTitle size="sm">Something went wrong.</PageTitle>
      <Button className="mr-3" onClick={onPress}>
        Try again
      </Button>
    </div>
  )
}
