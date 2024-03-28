import { createClient } from 'contentful'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const CONTENTFUL_API_URL = requiredOutsideLocalEnv(
  process.env.CONTENTFUL_API_URL,
  'CONTENTFUL_API_URL',
  'all contentful related',
)!

const CONTENTFUL_ACCESS_TOKEN = requiredOutsideLocalEnv(
  process.env.CONTENTFUL_ACCESS_TOKEN,
  'CONTENTFUL_ACCESS_TOKEN',
  'all contentful related',
)!

const CONTENTFUL_SPACE_ID = requiredOutsideLocalEnv(
  process.env.CONTENTFUL_SPACE_ID,
  'CONTENTFUL_SPACE_ID',
  'all contentful related',
)!

export const contentfulClient = createClient({
  accessToken: CONTENTFUL_ACCESS_TOKEN,
  space: CONTENTFUL_SPACE_ID,
  host: CONTENTFUL_API_URL,
})
