'use client'

import { Wallet } from 'lucide-react'
import { useMemo } from 'react'

import { UserActionFormOptInSWCDialog } from '@/components/app/userActionFormOptInSWC/dialog'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { useThirdWeb, useEnsProfile } from '@/hooks/useThirdWeb'
import { parseIpfsImageUrl } from '@/utils/shared/ipfs'

import { InfoLine } from './infoLine'
import { getCurrencyIcon } from './getCurrencyIcon'

export function NavbarLoggedInSessionPopoverContent() {
  const { getParsedAddress, logoutAndDisconnect, formattedBalance, wallet, chain, balance } =
    useThirdWeb()

  const ensProfile = useEnsProfile()

  const currencyIconUrl = useMemo(
    () => (balance ? getCurrencyIcon(balance?.symbol) : null),
    [balance],
  )

  const walletIconUrl = useMemo(() => {
    if (!wallet) {
      return ''
    }

    return parseIpfsImageUrl(wallet.getMeta().iconURL)
  }, [wallet])

  const walletName = useMemo(() => {
    return ensProfile.name ?? getParsedAddress({ numStartingChars: 6 })
  }, [ensProfile, getParsedAddress])

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center gap-4">
          <WalletIcon walletIconUrl={walletIconUrl} ensProfileAvatar={ensProfile.avatar} />

          <span>{walletName}</span>
        </div>

        <UserActionFormOptInSWCDialog>
          <Button className="w-full">JOIN THE FIGHT</Button>
        </UserActionFormOptInSWCDialog>
      </div>
      <hr />
      <div className="flex flex-col gap-6 p-4">
        {balance && (
          <InfoLine
            label="Balance"
            value={<span className="md:text-sm">{formattedBalance}</span>}
            image={{
              alt: balance.name,
              src: currencyIconUrl ?? '',
            }}
          />
        )}

        {chain && (
          <InfoLine
            label="Current network"
            value={chain.name}
            image={{
              alt: chain.name,
              src: parseIpfsImageUrl(chain.icon?.url ?? ''),
            }}
          />
        )}

        <Button variant="outline" className="w-full" onClick={logoutAndDisconnect}>
          Logout
        </Button>
      </div>
    </div>
  )
}

function WalletIcon({
  walletIconUrl,
  ensProfileAvatar,
}: {
  walletIconUrl?: string
  ensProfileAvatar?: string
}) {
  if (ensProfileAvatar) {
    return <NextImage src={ensProfileAvatar} alt="ENS Profile Avatar" width={36} height={36} />
  }

  if (walletIconUrl) {
    return <NextImage src={walletIconUrl} alt="Wallet Icon" width={36} height={36} />
  }

  return (
    <div className="w-fit rounded-full bg-secondary p-3">
      <Wallet width={20} height={20} />
    </div>
  )
}
