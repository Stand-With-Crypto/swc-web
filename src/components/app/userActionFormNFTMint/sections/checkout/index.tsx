import Balancer from 'react-wrap-balancer'
import { Minus, Plus } from 'lucide-react'
import React from 'react'

import {
  NFTDisplay,
  NFTDisplaySkeleton,
  UserActionFormLayout,
} from '@/components/app/userActionFormCommon'
import { UserActionFormNFTMintSectionNames } from '@/components/app/userActionFormNFTMint'
import { MINT_NFT_CONTRACT_ADDRESS } from '@/components/app/userActionFormNFTMint/constants'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UseSectionsReturn } from '@/hooks/useSections'
import { SupportedCryptoCurrencyCodes } from '@/utils/shared/currency'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { UseCheckoutControllerReturn } from '@/components/app/userActionFormNFTMint/useCheckoutController'

import styles from './checkout.module.css'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Web3Button,
  useAddress,
  useContract,
  useContractMetadata,
  useMintNFT,
} from '@thirdweb-dev/react'
import { cn } from '@/utils/web/cn'

interface UserActionFormNFTMintCheckoutProps
  extends UseSectionsReturn<UserActionFormNFTMintSectionNames>,
    UseCheckoutControllerReturn {
  onMint: () => void
}

export function UserActionFormNFTMintCheckout({
  goToSection,
  quantity,
  incrementQuantity,
  decrementQuantity,
  setQuantity,
  mintFee,
  totalFee,
  gasFee,
  onMint,
}: UserActionFormNFTMintCheckoutProps) {
  const { contract } = useContract(MINT_NFT_CONTRACT_ADDRESS)
  const { data: contractMetadata, isLoading: isLoadingMetadata } = useContractMetadata(contract)
  const { mutateAsync: mintNFT, isLoading: isMintingNFT, error } = useMintNFT(contract)
  const address = useAddress()

  if (!contractMetadata || isLoadingMetadata || !address) {
    return (
      <UserActionFormLayout>
        <UserActionFormLayout.Container>
          <NFTDisplaySkeleton size="sm" />
        </UserActionFormLayout.Container>
      </UserActionFormLayout>
    )
  }

  const handleMintNFT = async () => {
    mintNFT(
      {
        metadata: contractMetadata,
        to: address,
      },
      {
        onSuccess: () => {},
      },
    )
  }

  return (
    <UserActionFormLayout onBack={() => goToSection(UserActionFormNFTMintSectionNames.INTRO)}>
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

        <Card className="w-full">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="max-w-96">
                <p>Donation</p>
                <p className="text-xs text-muted-foreground">
                  <Balancer>
                    {mintFee}
                    {SupportedCryptoCurrencyCodes.ETH} of the mint fee will be donated to Stand With
                    Crypto Alliance, Inc. (SWCA). Donations from foreign nationals and government
                    contractors are prohibited.
                  </Balancer>
                </p>
              </div>

              <CurrencyDisplay value={mintFee} />
            </div>

            <div className="flex items-center justify-between">
              <p>Gas fee</p>
              <CurrencyDisplay value={gasFee} />
            </div>

            <div className="flex items-center justify-between">
              <p>Total</p>
              <CurrencyDisplay value={totalFee} />
            </div>
          </div>
        </Card>

        <UserActionFormLayout.Footer>
          <Web3Button
            className={cn(buttonVariants({ variant: 'default', size: 'lg' }))}
            contractAddress={MINT_NFT_CONTRACT_ADDRESS}
            action={onMint}
          >
            Mint now
          </Web3Button>

          <Button
            size="lg"
            onClick={() => {
              goToSection(UserActionFormNFTMintSectionNames.SUCCESS)
            }}
          >
            Mint now
          </Button>
        </UserActionFormLayout.Footer>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

function CurrencyDisplay({ value }: { value?: string }) {
  if (!value) {
    return <Skeleton className="min-w-max" />
  }

  return (
    <p className="min-w-max">
      {value} {SupportedCryptoCurrencyCodes.ETH}
    </p>
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
    if (newValue > 0 && newValue <= 1000) {
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
