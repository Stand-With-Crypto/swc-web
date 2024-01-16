import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { once } from 'lodash'

export interface Tab {
  id: string
  component: React.ComponentType
}

export interface UseTabsProps<T = any> {
  tabs: Tab[]
  initialTabId?: string | (() => string)
  tabAdditionalContext?: T
}

interface UseTabsContextValue<T = any> {
  currentTab: string
  gotoTab: (tabId: string) => void
  tabAdditionalContext?: T
}

const createUseTabsContext = once(<T,>() =>
  React.createContext<UseTabsContextValue<T> | null>(null),
)

export function useTabsContext<T = any>() {
  const context = React.useContext(createUseTabsContext<T>())
  if (!context) {
    const err = new Error('useTabsContext must be used within a useTabs component')
    Sentry.captureException(err)
    throw err
  }
  return context
}

export function useTabs<T = any>({ tabs, initialTabId, tabAdditionalContext }: UseTabsProps<T>) {
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

  const UseTabsContext = createUseTabsContext<T>()
  return {
    currentTab,
    gotoTab,
    component: (
      <UseTabsContext.Provider
        value={{
          currentTab,
          gotoTab,
          tabAdditionalContext,
        }}
      >
        <CurrentComponent />
      </UseTabsContext.Provider>
    ),
  }
}
