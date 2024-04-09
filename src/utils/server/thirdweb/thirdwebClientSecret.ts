import { requiredEnv } from '@/utils/shared/requiredEnv'

export const THIRD_WEB_CLIENT_SECRET = requiredEnv(
  process.env.THIRD_WEB_CLIENT_SECRET,
  'THIRD_WEB_CLIENT_SECRET',
)
