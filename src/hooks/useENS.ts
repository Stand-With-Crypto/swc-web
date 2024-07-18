import useSWR from 'swr'
import { resolveAvatar, resolveName } from 'thirdweb/extensions/ens'
import { useActiveAccount } from 'thirdweb/react'

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
  const activeAccount = useActiveAccount()
  const address = activeAccount?.address

  return useSWR(address, () => getData(address), {})
}
