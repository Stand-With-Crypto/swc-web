'use client'

import '@/utils/web/builder/registerComponents'

import { maybeInitBuilderReactClient } from '@/utils/web/builder'

maybeInitBuilderReactClient()

export function TopLevelBuilderClientLogic({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
