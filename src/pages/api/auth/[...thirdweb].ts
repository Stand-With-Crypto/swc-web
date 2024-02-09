// LATER-TASK migrate to app router once thirdweb supports it

import { ThirdwebAuth } from '@thirdweb-dev/auth/next'

import { thirdwebAuthConfig } from '@/utils/server/thirdweb/thirdwebAuthConfig'

export default ThirdwebAuth(thirdwebAuthConfig).ThirdwebAuthHandler()
