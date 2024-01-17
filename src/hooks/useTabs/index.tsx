import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { once } from 'lodash'

export interface Tab<TabKey extends string, TabProps = object> {
  id: TabKey
  component: React.ComponentType<TabProps>
}

export interface UseTabsProps<TabKey extends string, TabProps = object> {
  tabs: {
    id: TabKey
    component: React.ComponentType<TabProps>
  }[]
  initialTabId?: TabKey | (() => TabKey)
  componentProps?: TabProps
}

interface UseTabsContextValue<TabKey extends string = string> {
  currentTab: TabKey
  gotoTab: (tabId: TabKey) => void
}

const createUseTabsContext = once(<TabKey extends string>() =>
  React.createContext<UseTabsContextValue<TabKey> | null>(null),
)

export function useTabsContext<TabKey extends string>() {
  const context = React.useContext(createUseTabsContext<TabKey>())
  if (!context) {
    const err = new Error('useTabsContext must be used within a useTabs component')
    Sentry.captureException(err)
    throw err
  }
  return context
}

export function useTabs<TabKey extends string, TabProps = object>({
  tabs,
  initialTabId,
  componentProps = {} as TabProps,
}: UseTabsProps<TabKey, TabProps>) {
  if (!tabs.length) {
    const err = new Error('useTabs: tabs must not be empty')
    Sentry.captureException(err)
    throw err
  }

  const [currentTab, setCurrentTab] = React.useState<TabKey>(initialTabId ?? tabs[0].id)

  const gotoTab = React.useCallback(
    (tabId: TabKey) => {
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

  const UseTabsContext = createUseTabsContext<TabKey>()
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
          <CurrentComponent {...(componentProps as TabProps & JSX.IntrinsicAttributes)} />
        </UseTabsContext.Provider>
      </>
    ),
  }
}
