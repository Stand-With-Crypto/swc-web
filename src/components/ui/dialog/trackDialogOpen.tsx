'use client'

import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import {
  PrimitiveComponentAnalytics,
  trackPrimitiveComponentAnalytics,
} from '@/utils/web/primitiveComponentAnalytics'

export function trackDialogOpen({
  open,
  analytics,
}: { open: boolean } & PrimitiveComponentAnalytics<boolean>) {
  return trackPrimitiveComponentAnalytics(
    ({ properties }) => {
      trackClientAnalytic(`Dialog ${open ? 'Opened' : 'Closed'}`, {
        component: AnalyticComponentType.modal,
        action: AnalyticActionType.view,
        ...properties,
      })
    },
    { args: open, analytics },
  )
}
