import 'server-only'

import { getAuthUser } from '@/utils/server/authentication/getAuthUser'
import { getThirdwebAuthUser } from '@/utils/server/thirdweb/getThirdwebAuthUser'

export async function getAuthUserSSR() {
  const thirdwebAuthData = await getThirdwebAuthUser({ isSSR: true })

  if (thirdwebAuthData) {
    return thirdwebAuthData
  }

  return getAuthUser()
}
