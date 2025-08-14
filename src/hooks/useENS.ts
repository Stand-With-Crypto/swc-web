import useSWR from 'swr'
import { resolveAvatar, resolveName } from 'thirdweb/extensions/ens'
import { useSocialProfiles } from 'thirdweb/react'

import { useThirdwebAuthUser } from '@/hooks/useAuthUser'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'

async function getData(address?: string) {
  if (!address) {
    return null
  }

  try {
    const ens = await resolveName({
      client: thirdwebClient,
      address,
    })

    console.log('ens', ens, thirdwebClient)

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
  } catch (error) {
    console.error(error)
    return null
  }
}

export function useENS() {
  const { user } = useThirdwebAuthUser()
  const address = user?.address
  console.log({ address, thirdwebClient })
  const { data: socialProfiles } = useSocialProfiles({
    client: thirdwebClient,
    address,
  })

  const correctProfile = socialProfiles?.find(profile => profile.type === 'ens')

  console.log({ correctProfile, socialProfiles })

  return useSWR(address, getData, {
    errorRetryCount: 0,
  })
}
