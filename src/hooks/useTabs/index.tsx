import React from 'react'
import * as Sentry from '@sentry/nextjs'

export interface Tab<TabProps = object> {
  id: string
  component: React.ComponentType<TabProps>
}

export interface UseTabsProps<TabProps = object> {
  tabs: Tab<TabProps>[]
  initialTabId?: string | (() => string)
  tabAdditionalContext?: TabProps
}

interface UseTabsContextValue {
  currentTab: string
  gotoTab: (tabId: string) => void
}

const UseTabsContext = React.createContext<UseTabsContextValue | null>(null)

export function useTabsContext() {
  const context = React.useContext(UseTabsContext)
  if (!context) {
    const err = new Error('useTabsContext must be used within a useTabs component')
    Sentry.captureException(err)
    throw err
  }
  return context
}

export function useTabs<TabProps = object>({
  tabs,
  initialTabId,
  tabAdditionalContext = {} as TabProps,
}: UseTabsProps<TabProps>) {
  if (!tabs.length) {
    const err = new Error('useTabs: tabs must not be empty')
    Sentry.captureException(err)
    throw err
  }

  const [currentTab, setCurrentTab] = React.useState(initialTabId ?? tabs[0].id)

  const gotoTab = React.useCallback(
    (tabId: string) => {
      setCurrentTab(tabId)
    },
    [setCurrentTab],
  )

  const CurrentComponent = React.useMemo(
    () => tabs.find(tab => tab.id === currentTab)?.component,
    [currentTab, tabs],
  )

  if (!CurrentComponent) {
    const err = new Error(`useTabs: tab with id ${currentTab} not found`)
    Sentry.captureException(err)
    throw err
  }

  return {
    currentTab,
    gotoTab,
    component: (
      <>
        <UseTabsContext.Provider
          value={{
            currentTab,
            gotoTab,
          }}
        >
          <CurrentComponent {...(tabAdditionalContext as TabProps & JSX.IntrinsicAttributes)} />
        </UseTabsContext.Provider>
      </>
    ),
  }
}
