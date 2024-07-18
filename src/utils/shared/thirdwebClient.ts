import { createThirdwebClient } from 'thirdweb'

import { requiredEnv } from '@/utils/shared/requiredEnv'

const isServerSide = typeof window === 'undefined'

const NEXT_PUBLIC_THIRDWEB_CLIENT_ID = requiredEnv(
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  'process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID',
)

const THIRD_WEB_CLIENT_SECRET = isServerSide
  ? requiredEnv(process.env.THIRD_WEB_CLIENT_SECRET, 'process.env.THIRD_WEB_CLIENT_SECRET')
  : null

const clientId = NEXT_PUBLIC_THIRDWEB_CLIENT_ID
const secretKey = THIRD_WEB_CLIENT_SECRET

export const thirdwebClient = createThirdwebClient(secretKey ? { secretKey } : { clientId })
