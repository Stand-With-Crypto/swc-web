import * as React from 'react'

import { useIsMobile } from '@/hooks/useIsMobile'

export function usePreventMobileKeyboardOffset(enabled: boolean) {
  const isMobile = useIsMobile()

  const scrollHeight = sessionStorage.getItem('scrollHeight')

  const handleKeyboardOffset = React.useCallback(() => {
    if (!isMobile) return

    if (enabled) {
      sessionStorage.setItem('scrollHeight', String(window.scrollY))
      window.scrollTo(0, 0)
      return
    }

    if (!scrollHeight) return
    window.scrollTo(0, Number(scrollHeight))
    sessionStorage.removeItem('scrollHeight')
    return
  }, [isMobile, enabled, scrollHeight])

  React.useEffect(() => {
    handleKeyboardOffset()

    return () => {
      handleKeyboardOffset()
    }
  }, [handleKeyboardOffset])
}
