import { requiredEnv } from '@/utils/shared/requiredEnv'

export const NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN = requiredEnv(
  process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
  'process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN',
)

export const NEXT_PUBLIC_ENVIRONMENT = requiredEnv(
  process.env.NEXT_PUBLIC_ENVIRONMENT,
  'process.env.NEXT_PUBLIC_ENVIRONMENT',
)
