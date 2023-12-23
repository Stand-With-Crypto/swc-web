'use client'

import {
  ClientAnalyticActionType,
  ClientAnalyticComponentType,
  initAnalytics,
  trackClientAnalytic,
} from '@/utils/web/clientAnalytics'
import { maybeSetUserSessionIdOnClient } from '@/utils/web/clientUserSessionId'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// This component includes all top level client-side logic
export function TopLevelClientLogic() {
  const pathname = usePathname()
  // Not, in local dev this component will double render. It doesn't do this after it is built (verify in testing)
  useEffect(() => {
    const sessionId = maybeSetUserSessionIdOnClient()
    initAnalytics(sessionId)
  }, [])
  useEffect(() => {
    if (!pathname) {
      return
    }
    trackClientAnalytic('Page Visited', {
      pathname,
      component: ClientAnalyticComponentType.page,
      action: ClientAnalyticActionType.view,
    })
  }, [pathname])
  return null
}
