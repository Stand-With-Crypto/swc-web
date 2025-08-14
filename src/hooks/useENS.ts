import useSWR from 'swr'
import { resolveAvatar, resolveName } from 'thirdweb/extensions/ens'

import { useThirdwebAuthUser } from '@/hooks/useAuthUser'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'

async function getData(address?: string) {
  if (!address) {
    return null
  }

  const ens = await resolveName({
    client: thirdwebClient,
    address,
  })

  const avatarUrl = ens
    ? await resolveAvatar({
        client: thirdwebClient,
        name: ens,
      })
    : null

  return {
    ens,
    avatarUrl,
  }
}

export function useENS() {
  // const { user } = useThirdwebAuthUser()
  // const address = user?.address
  const address = '0x4e44496c0866ca8e908349eb03a43937a94ef661'

  return useSWR(address, getData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false,
    revalidateIfStale: false,
    revalidateOnError: false,
    revalidateIfHidden: false,
  })
}
