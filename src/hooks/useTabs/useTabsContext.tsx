import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { once } from 'lodash'

import { UseTabsContextValue, UseTabsProps, UseTabsReturn } from './useTabs.types'

export const createUseTabsContext = once(<TabKey extends string>() =>
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
