import {
  NFTDisplay,
  NFTDisplaySkeleton,
  UserActionFormLayout,
} from '@/components/app/userActionFormCommon'
import { UserActionFormNFTMintTabNames } from '@/components/app/userActionFormNFTMint'
import {
  MINT_NFT_CONTRACT_ADDRESS,
  NFT_DONATION_AMOUNT,
  NFT_DONATION_GAS_FEE,
} from '@/components/app/userActionFormNFTMint/constants'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UseTabsReturn } from '@/hooks/useTabs'
import { useThirdwebContractMetadata } from '@/hooks/useThirdwebContractMetadata'
import { SupportedCryptoCurrencyCodes } from '@/utils/shared/currency'
import { Minus, Plus } from 'lucide-react'
import React from 'react'

import styles from './checkout.module.css'

export function UserActionFormNFTMintCheckout({
  gotoTab,
}: UseTabsReturn<UserActionFormNFTMintTabNames>) {
  const { data: contractMetadata, isLoading } =
    useThirdwebContractMetadata(MINT_NFT_CONTRACT_ADDRESS)

  const [quantity, setQuantity] = React.useState(1)

  const fixDecimals = (value: number) => Number(value.toFixed(5))

  if (!contractMetadata || isLoading) {
    return (
      <UserActionFormLayout>
        <UserActionFormLayout.Container>
          <NFTDisplaySkeleton size="sm" />
        </UserActionFormLayout.Container>
      </UserActionFormLayout>
    )
  }

  return (
    <UserActionFormLayout onBack={() => gotoTab(UserActionFormNFTMintTabNames.INTRO)}>
      <UserActionFormLayout.Container>
        <NFTDisplay size="sm" src={contractMetadata?.image ?? ''} alt={contractMetadata.name} raw />

        <Card>
          <div className="flex items-center justify-between">
            <p>Quantity</p>
            <QuantityInput value={quantity} onChange={setQuantity} />
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <p>Donation</p>
              <p>
                {fixDecimals(NFT_DONATION_AMOUNT * quantity)} {SupportedCryptoCurrencyCodes.ETH}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p>Gas fee</p>
              <p>
                {fixDecimals(NFT_DONATION_GAS_FEE)} {SupportedCryptoCurrencyCodes.ETH}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p>Total</p>
              <p>
                {fixDecimals(NFT_DONATION_AMOUNT * quantity + NFT_DONATION_GAS_FEE)}{' '}
                {SupportedCryptoCurrencyCodes.ETH}
              </p>
            </div>
          </div>
        </Card>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

function QuantityInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-5">
      <Button
        size="icon"
        variant="secondary"
        className="h-8 w-8 bg-white hover:bg-white/80"
        onClick={() => {
          if (value > 1) {
            onChange(value - 1)
          }
        }}
        disabled={value <= 1}
      >
        <Minus />
      </Button>

      <input type="number" className={styles.numberInput} value={value} />

      <p>{value}</p>

      <Button
        size="icon"
        variant="secondary"
        className="h-8 w-8 bg-white hover:bg-white/80"
        onClick={() => onChange(value + 1)}
      >
        <Plus />
      </Button>
    </div>
  )
}
