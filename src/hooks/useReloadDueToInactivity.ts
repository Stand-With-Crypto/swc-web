import { useEffect, useRef } from 'react'
import { debounce } from 'lodash-es'
import { usePathname } from 'next/navigation'

import { AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'

export function useReloadDueToInactivity({ timeInMinutes }: { timeInMinutes: number }) {
  const pathname = usePathname()

  const reloadPage = () => {
    if (typeof window !== 'undefined') {
      trackClientAnalytic(
        'Page Reloaded Due To Inactivity',
        {
          pathname,
          component: AnalyticComponentType.page,
        },
        // track analytics callback
        () => window.location.reload(),
      )
    }
  }

  const debouncedReloadRef = useRef(debounce(reloadPage, timeInMinutes * 60 * 1000))

  const resetTimer = () => {
    debouncedReloadRef.current()
  }

  useEffect(() => {
    const debounceReloadRef = debouncedReloadRef.current

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

    events.forEach(event => window.addEventListener(event, resetTimer))

    resetTimer()

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer))

      debounceReloadRef.cancel()
    }
  }, [debouncedReloadRef, timeInMinutes])

  return null
}
