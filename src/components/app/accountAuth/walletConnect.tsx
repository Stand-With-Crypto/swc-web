'use client'

import { SelectUIProps, WalletConfig, WalletInstance } from '@thirdweb-dev/react'
import { walletIds } from '@thirdweb-dev/wallets'
import React from 'react'

import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { PageTitle } from '@/components/ui/pageTitleText'

export interface WalletSelectUIProps {
  connect: (walletConfig: WalletConfig, options?: any) => Promise<WalletInstance>
  connectionStatus: SelectUIProps<any>['connectionStatus']
  createWalletInstance: (walletConfig: WalletConfig) => WalletInstance
  setConnectedWallet: SelectUIProps<any>['setConnectedWallet']
  setConnectionStatus: SelectUIProps<any>['setConnectionStatus']
  connectedWallet?: WalletInstance
  connectedWalletAddress?: string
}

interface WalletSelectorProps {
  walletConfigs: WalletConfig[]
  selectWallet: (wallet: WalletConfig) => void
  // Thirdweb doesn't give a type definition for wallet data
  setSelectionData: (data: any) => void
  onGetStarted: () => void
  selectUIProps: WalletSelectUIProps
}

export function WalletConnect(props: WalletSelectorProps) {
  const { walletConfigs, selectWallet, selectUIProps, setSelectionData } = props

  if (walletConfigs.some(config => config.category === 'socialLogin')) {
    throw new Error('socialLogin is not supported in the wallet selector')
  }

  const nonLocalWalletConfigs = walletConfigs.filter(w => w.id !== walletIds.localWallet)

  return (
    <div className="space-y-4 p-3 md:p-0">
      <PageTitle size="sm">Select a wallet</PageTitle>
      <WalletSelection
        walletConfigs={nonLocalWalletConfigs}
        selectWallet={selectWallet}
        selectUIProps={selectUIProps}
        setSelectionData={setSelectionData}
      />
    </div>
  )
}

export function WalletSelection(props: {
  walletConfigs: WalletConfig[]
  selectWallet: (wallet: WalletConfig) => void
  maxHeight?: string
  selectUIProps: WalletSelectUIProps
  setSelectionData: WalletSelectorProps['setSelectionData']
}) {
  const walletConfigs = sortWalletConfigs(props.walletConfigs)

  return (
    <ul className="space-y-4">
      {walletConfigs.map(walletConfig => (
        <li key={walletConfig.id}>
          <WalletEntryButton
            walletConfig={walletConfig}
            selectWallet={() => {
              props.selectWallet(walletConfig)
            }}
          />
        </li>
      ))}
    </ul>
  )
}

export function WalletEntryButton(props: {
  walletConfig: WalletConfig<any>
  selectWallet: () => void
}) {
  const { walletConfig, selectWallet } = props
  const isRecommended = walletConfig.recommended
  return (
    <Button
      variant="secondary"
      type="button"
      className="grid h-auto w-full grid-cols-[repeat(3,minmax(max-content,1fr))] gap-2 px-3 py-2"
      onClick={() => {
        selectWallet()
      }}
    >
      <div className="h-9 w-9 overflow-hidden rounded-full">
        <NextImage
          src={walletConfig.meta.iconURL}
          width={36}
          height={36}
          alt={`${walletConfig.meta.name} wallet icon`}
        />
      </div>
      <div>
        <p className="font-semibold">{walletConfig.meta.name}</p>
        {isRecommended && <p className="text-sm text-muted-foreground">Recommended</p>}
        {!isRecommended && walletConfig.isInstalled && walletConfig.isInstalled() && (
          <p className="text-sm text-muted-foreground">Installed</p>
        )}
      </div>
    </Button>
  )
}

function sortWalletConfigs(walletConfigs: WalletConfig[]) {
  return (
    walletConfigs
      // show the installed wallets first
      .sort((a, b) => {
        const aInstalled = a.isInstalled ? a.isInstalled() : false
        const bInstalled = b.isInstalled ? b.isInstalled() : false

        if (aInstalled && !bInstalled) {
          return -1
        }
        if (!aInstalled && bInstalled) {
          return 1
        }
        return 0
      })
      // show the recommended wallets even before that
      .sort((a, b) => {
        if (a.recommended && !b.recommended) {
          return -1
        }
        if (!a.recommended && b.recommended) {
          return 1
        }
        return 0
      })
      // show the wallets with selectUI first before others
      .sort((a, b) => {
        if (a.selectUI && !b.selectUI) {
          return -1
        }
        if (!a.selectUI && b.selectUI) {
          return 1
        }
        return 0
      })
  )
}
