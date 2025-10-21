import PostGrid from 'postgrid-node'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const POSTGRID_API_KEY = requiredOutsideLocalEnv(
  process.env.POSTGRID_API_KEY,
  'POSTGRID_API_KEY',
  'PostGrid Letter Sending',
)

export const postgridClient = POSTGRID_API_KEY ? new PostGrid({ apiKey: POSTGRID_API_KEY }) : null

