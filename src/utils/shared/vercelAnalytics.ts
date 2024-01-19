import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import { track } from '@vercel/analytics'
import _ from 'lodash'

export function formatVercelAnalyticsEventProperties(eventProperties: AnalyticProperties) {
  return Object.entries(eventProperties).reduce(
    (acc, [key, value]) => {
      if (_.isDate(value)) {
        acc[key] = value.toISOString()
      } else if (value === undefined) {
        // acc[key] = value
      } else if (_.isArray(value)) {
        acc[key] = value.join(', ')
      } else {
        acc[key] = value
      }
      return acc
    },
    {} as NonNullable<Parameters<typeof track>[1]>,
  )
}
