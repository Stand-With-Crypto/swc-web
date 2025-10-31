import PostGrid from 'postgrid-node'

import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const POSTGRID_API_KEY = requiredOutsideLocalEnv(
  process.env.POSTGRID_API_KEY,
  'POSTGRID_API_KEY',
  'PostGrid Letter Sending',
)

export const postgridClient = POSTGRID_API_KEY
  ? new PostGrid({
      apiKey: POSTGRID_API_KEY,
      fetch: (url, options) =>
        fetchReq(url.toString(), options, {
          withScope: scope => {
            scope.setTags({ domain: 'postgridClient' })
          },
        }),
    })
  : null
