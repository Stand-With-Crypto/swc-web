// LATER-TASK migrate to app router once thirdweb supports it

import { thirdwebAuthConfig } from '@/utils/server/thirdweb/thirdwebAuthConfig'
import { ThirdwebAuth } from '@thirdweb-dev/auth/next'

export default ThirdwebAuth(thirdwebAuthConfig).ThirdwebAuthHandler()
