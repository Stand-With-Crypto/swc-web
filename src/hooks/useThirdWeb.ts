import React from 'react'
import {
  useDisconnect,
  useUser,
  useChain,
  useLogout,
  useBalance,
  useWallet,
} from '@thirdweb-dev/react'

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
