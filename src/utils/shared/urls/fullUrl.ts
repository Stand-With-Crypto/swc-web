import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const NEXT_PUBLIC_VERCEL_BRANCH_URL = requiredOutsideLocalEnv(
  process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,
  'NEXT_PUBLIC_VERCEL_BRANCH_URL',
  null,
)

export const fullUrl = (path: string) => {
  switch (NEXT_PUBLIC_ENVIRONMENT) {
    case 'local':
      return `http://localhost:3000${path}`
    case 'testing':
      return `https://testing.standwithcrypto.org${path}`
    case 'preview':
      return `https://${NEXT_PUBLIC_VERCEL_BRANCH_URL!}${path}`
    case 'production':
      return `https://www.standwithcrypto.org${path}`
  }
}
