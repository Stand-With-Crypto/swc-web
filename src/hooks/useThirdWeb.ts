import React from 'react'
import {
  useDisconnect,
  useUser,
  useAddress,
  useChain,
  useLogout,
  useBalance,
  useWallet,
} from '@thirdweb-dev/react'
import { useEnsAvatar, useEnsName } from 'wagmi'
import { normalize } from 'viem/ens'
import { parseIpfsImageUrl } from '@/utils/shared/ipfs'

export function useThirdWeb() {
  const disconnect = useDisconnect()
  const { logout } = useLogout()
  const session = useUser()
  const chain = useChain()
  const { data: balance } = useBalance()
  const wallet = useWallet()

  const getParsedAddress = React.useCallback(
    ({ numStartingChars = 2 } = {}) => {
      if (!session.user?.address) {
        return ''
      }

      const { address } = session.user
      const start = address.slice(0, numStartingChars)
      const end = address.slice(-4)
      return `${start}...${end}`
    },
    [session.user?.address],
  )

  const formattedBalance = React.useMemo(() => {
    if (!balance) {
      return
    }

    return `${balance.displayValue} ${balance.symbol}`
  }, [balance])

  return {
    session,
    chain,
    balance,
    formattedBalance,
    wallet,

    logoutAndDisconnect: () => {
      logout()
      disconnect()
    },
    getParsedAddress,
  }
}

type ENSProfile = { name?: string; avatar?: string }
export function useEnsProfile(): { name?: string; avatar?: string } {
  const address = useAddress()

  const { data: name } = useEnsName(address ? { address: address as `0x${string}` } : undefined)
  const { data: avatar } = useEnsAvatar(name ? { name: normalize(name) } : undefined)

  return React.useMemo(() => {
    const profile: ENSProfile = {}

    if (name) {
      profile.name = name
    }

    if (avatar) {
      profile.avatar = parseIpfsImageUrl(avatar)
    }

    return profile
  }, [name, avatar])
}
