import React from 'react'
import * as Sentry from '@sentry/nextjs'

import { UseTabsProps, UseTabsReturn } from './useTabs.types'
import { createUseTabsContext } from './useTabsContext'

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

  const UseTabsContext = createUseTabsContext<TabKey>()
  return React.useMemo<UseTabsReturn<TabKey>>(
    () => ({
      currentTab,
      gotoTab,
      onTabNotFound: handleTabNotFound,
      TabsProvider: (props: React.PropsWithChildren) => (
        <UseTabsContext.Provider
          value={{
            gotoTab,
            currentTab,
            onTabNotFound: handleTabNotFound,
          }}
          {...props}
        />
      ),
    }),
    [currentTab, gotoTab, UseTabsContext],
  )
}

export { useTabsContext } from './useTabsContext'
