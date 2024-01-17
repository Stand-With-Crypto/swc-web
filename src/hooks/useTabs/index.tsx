import React from 'react'
import * as Sentry from '@sentry/nextjs'

import { UseTabsProps, UseTabsReturn } from './useTabs.types'

export function useTabs<TabKey extends string>({
  tabs,
  initialTabId,
}: UseTabsProps<TabKey>): UseTabsReturn<TabKey> {
  if (!tabs.length) {
    const err = new Error('useTabs: tabs must not be empty')
    Sentry.captureException(err)
    throw err
  }

  const [currentTab, setCurrentTab] = React.useState<TabKey>(initialTabId ?? tabs[0])

  const gotoTab = React.useCallback(
    (tabId: TabKey) => {
      setCurrentTab(tabId)
    },
    [setCurrentTab],
  )

  const handleTabNotFound = React.useCallback(() => {
    const err = new Error(`useTabs: tab not found: ${currentTab}`)
    Sentry.captureException(err)
    throw err
  }, [currentTab])

  return React.useMemo<UseTabsReturn<TabKey>>(
    () => ({
      currentTab,
      gotoTab,
      onTabNotFound: handleTabNotFound,
    }),
    [currentTab, gotoTab],
  )
}

export * from './useTabs.types'
