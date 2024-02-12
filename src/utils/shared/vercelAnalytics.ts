import { track } from '@vercel/analytics'
import _ from 'lodash'

import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'

// vercel has a stricter type definition of what is an acceptable event property. Transforming our broader list of values to something more narrow
export function formatVercelAnalyticsEventProperties(eventProperties: AnalyticProperties) {
  return Object.entries(eventProperties).reduce(
    (acc, [key, value]) => {
      if (_.isDate(value)) {
        acc[key] = value.toISOString()
      } else if (_.isArray(value)) {
        acc[key] = value.join(', ')
      } else if (value !== undefined) {
        acc[key] = value
      }
      return acc
    },
    {} as NonNullable<Parameters<typeof track>[1]>,
  )
}
