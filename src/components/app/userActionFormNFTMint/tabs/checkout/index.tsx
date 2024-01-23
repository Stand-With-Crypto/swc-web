import Balancer from 'react-wrap-balancer'
import { Minus, Plus } from 'lucide-react'
import React from 'react'

import {
  NFTDisplay,
  NFTDisplaySkeleton,
  UserActionFormLayout,
} from '@/components/app/userActionFormCommon'
import { UserActionFormNFTMintTabNames } from '@/components/app/userActionFormNFTMint'
import { MINT_NFT_CONTRACT_ADDRESS } from '@/components/app/userActionFormNFTMint/constants'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UseTabsReturn } from '@/hooks/useTabs'
import { useThirdwebContractMetadata } from '@/hooks/useThirdwebContractMetadata'
import { SupportedCryptoCurrencyCodes } from '@/utils/shared/currency'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { UseCheckoutControllerReturn } from '@/components/app/userActionFormNFTMint/useCheckoutController'

import styles from './checkout.module.css'

export function UserActionFormNFTMintCheckout({
  gotoTab,
  quantity,
  incrementQuantity,
  decrementQuantity,
  setQuantity,
  mintFee,
  totalFee,
  gasFee,
}: UseTabsReturn<UserActionFormNFTMintTabNames> & UseCheckoutControllerReturn) {
  const { data: contractMetadata, isLoading } =
    useThirdwebContractMetadata(MINT_NFT_CONTRACT_ADDRESS)

  console.log({ gasFee, mintFee, totalFee })
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
        <div className="flex gap-6">
          <NFTDisplay
            size="sm"
            src={contractMetadata?.image ?? ''}
            alt={contractMetadata.name}
            raw
          />

          <div>
            <PageTitle size="sm" className="text-start">
              {contractMetadata.name}
            </PageTitle>

            <PageSubTitle className="text-start">on Base Network</PageSubTitle>
          </div>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <p>Quantity</p>
            <QuantityInput
              value={quantity}
              onChange={setQuantity}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
            />
          </div>
        </Card>

        <Card>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p>Donation</p>
                <p className="text-xs text-muted-foreground">
                  <Balancer>
                    {fixDecimals(mintFee)}
                    {SupportedCryptoCurrencyCodes.ETH} of the mint fee will be donated to Stand With
                    Crypto Alliance, Inc. (SWCA). Donations from foreign nationals and government
                    contractors are prohibited.
                  </Balancer>
                </p>
              </div>

              <p className="min-w-max">
                {fixDecimals(mintFee)} {SupportedCryptoCurrencyCodes.ETH}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p>Gas fee</p>
              <p className="min-w-max">
                {fixDecimals(gasFee)} {SupportedCryptoCurrencyCodes.ETH}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p>Total</p>
              <p className="min-w-max">
                {fixDecimals(totalFee)} {SupportedCryptoCurrencyCodes.ETH}
              </p>
            </div>
          </div>
        </Card>

        <UserActionFormLayout.Footer>
          <Button
            size="lg"
            onClick={() => {
              gotoTab(UserActionFormNFTMintTabNames.SUCCESS)
            }}
          >
            Mint now
          </Button>
        </UserActionFormLayout.Footer>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

function QuantityInput({
  value,
  onChange,
  onIncrement,
  onDecrement,
}: {
  value: number
  onChange: (value: number) => void
  onIncrement: () => void
  onDecrement: () => void
}) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value)
    if (newValue > 0) {
      onChange(newValue)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="secondary"
        className="h-8 w-8 bg-white hover:bg-white/80"
        onClick={onDecrement}
        disabled={value <= 1}
      >
        <Minus />
      </Button>

      <div>
        <input
          type="number"
          className={styles.numberInput}
          value={value}
          onChange={handleInputChange}
          onFocus={event => event.target.select()}
        />
      </div>

      <Button
        size="icon"
        variant="secondary"
        className="h-8 w-8 bg-white hover:bg-white/80"
        onClick={onIncrement}
      >
        <Plus />
      </Button>
    </div>
  )
}
