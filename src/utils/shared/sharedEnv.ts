import { requiredEnv } from '@/utils/shared/requiredEnv'

export const NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN = requiredEnv(
  process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
  'process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN',
)

let initialEnv = requiredEnv(
  process.env.NEXT_PUBLIC_ENVIRONMENT,
  'process.env.NEXT_PUBLIC_ENVIRONMENT',
) as 'local' | 'testing' | 'production' | 'preview'
if (initialEnv === 'testing') {
  const NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF = requiredEnv(
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
    'NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF',
  )
  if (NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF !== 'main') {
    initialEnv = 'preview'
  }
}
export const NEXT_PUBLIC_ENVIRONMENT = initialEnv
