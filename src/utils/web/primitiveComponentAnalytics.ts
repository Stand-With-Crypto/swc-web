import { isFunction, isString } from 'lodash-es'

import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'

type AnalyticsFnCall<A> = (params: {
  args: A
  properties: { Category: string } & AnalyticProperties
}) => void

export interface PrimitiveComponentAnalytics<A> {
  analytics: string | ({ Category: string } & AnalyticProperties) | ((args: A) => void)
}

export function trackPrimitiveComponentAnalytics<A>(
  defaultTrack: AnalyticsFnCall<A>,
  { args, analytics }: { args: A } & PrimitiveComponentAnalytics<A>,
) {
  if (isString(analytics)) {
    defaultTrack({ args, properties: { Category: analytics } })
    return
  }
  if (isFunction(analytics)) {
    analytics(args)
    return
  }
  return defaultTrack({ args, properties: analytics })
}
