import Balancer from 'react-wrap-balancer'
import { Minus, Plus } from 'lucide-react'
import React from 'react'
import {
  Web3Button,
  useAddress,
  useConnectionStatus,
  useContract,
  useContractMetadata,
} from '@thirdweb-dev/react'

import {
  NFTDisplay,
  NFTDisplaySkeleton,
  UserActionFormLayout,
} from '@/components/app/userActionFormCommon'
import { UserActionFormNFTMintSectionNames } from '@/components/app/userActionFormNFTMint'
import { MINT_NFT_CONTRACT_ADDRESS } from '@/components/app/userActionFormNFTMint/constants'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UseSectionsReturn } from '@/hooks/useSections'
import { SupportedCryptoCurrencyCodes } from '@/utils/shared/currency'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { UseCheckoutControllerReturn } from '@/components/app/userActionFormNFTMint/useCheckoutController'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCheckoutError,
  CheckoutError,
} from '@/components/app/userActionFormNFTMint/sections/checkout/useCheckoutError'
import { toBigNumber } from '@/utils/shared/bigNumber'
import { theme } from '@/utils/web/thirdweb/theme'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { MintStatus } from '@/hooks/useSendMintNFTTransaction'
import { ErrorMessage } from '@/components/ui/errorMessage'

import styles from './checkout.module.css'

interface UserActionFormNFTMintCheckoutProps
  extends UseSectionsReturn<UserActionFormNFTMintSectionNames>,
    UseCheckoutControllerReturn {
  onMint: () => void
  mintStatus: MintStatus
}

const CHECKOUT_ERROR_TO_MESSAGE: Record<CheckoutError, string> = {
  insufficientFunds: 'Insufficient funds',
  networkSwitch: 'Please switch to the Base Network',
}

export function UserActionFormNFTMintCheckout({
  goToSection,
  quantity,
  incrementQuantity,
  decrementQuantity,
  setQuantity,
  mintFeeDisplay,
  totalFeeDisplay,
  totalFee,
  gasFeeDisplay,
  onMint,
  mintStatus,
}: UserActionFormNFTMintCheckoutProps) {
  const { contract } = useContract(MINT_NFT_CONTRACT_ADDRESS)
  const { data: contractMetadata, isLoading: isLoadingMetadata } = useContractMetadata(contract)
  const address = useAddress()
  const checkoutError = useCheckoutError({ totalFee: totalFee ?? toBigNumber('0') })
  const connectionStatus = useConnectionStatus()

  if (!contractMetadata || isLoadingMetadata || !address) {
    return (
      <UserActionFormLayout>
        <UserActionFormLayout.Container>
          <NFTDisplaySkeleton size="sm" />
        </UserActionFormLayout.Container>
      </UserActionFormLayout>
    )
  }

  const isLoading =
    mintStatus === 'loading' ||
    !contract ||
    connectionStatus === 'connecting' ||
    connectionStatus === 'unknown'
  return (
    <UserActionFormLayout onBack={() => goToSection(UserActionFormNFTMintSectionNames.INTRO)}>
      {isLoading && <LoadingOverlay />}
      <UserActionFormLayout.Container>
        <div className="flex gap-6">
          <NFTDisplay
            alt={contractMetadata.name}
            raw
            size="sm"
            src={contractMetadata?.image ?? ''}
          />

          <div>
            <PageTitle className="text-start" size="sm">
              {contractMetadata.name}
            </PageTitle>

            <PageSubTitle className="text-start">on Base Network</PageSubTitle>
          </div>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <p>Quantity</p>
            <QuantityInput
              onChange={setQuantity}
              onDecrement={decrementQuantity}
              onIncrement={incrementQuantity}
              value={quantity}
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
                    {mintFeeDisplay}
                    {SupportedCryptoCurrencyCodes.ETH} of the mint fee will be donated to Stand With
                    Crypto Alliance, Inc. (SWCA). Donations from foreign nationals and government
                    contractors are prohibited.
                  </Balancer>
                </p>
              </div>

              <CurrencyDisplay value={mintFeeDisplay} />
            </div>

            <div className="flex items-center justify-between">
              <p>Gas fee</p>
              <CurrencyDisplay value={gasFeeDisplay} />
            </div>

            <div className="flex items-center justify-between">
              <p>Total</p>
              <CurrencyDisplay value={totalFeeDisplay} />
            </div>
          </div>
        </Card>

        <UserActionFormLayout.Footer>
          <Web3Button
            action={onMint}
            className="!rounded-full disabled:pointer-events-none disabled:opacity-50"
            contractAddress={MINT_NFT_CONTRACT_ADDRESS}
            isDisabled={isLoading || (!!checkoutError && checkoutError !== 'networkSwitch')}
            theme={theme}
          >
            Mint now
          </Web3Button>

          {!!checkoutError && (
            <ErrorMessage>{CHECKOUT_ERROR_TO_MESSAGE[checkoutError]}</ErrorMessage>
          )}
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
        className="h-8 w-8 bg-white p-0 hover:bg-white/80"
        disabled={value <= 1}
        onClick={onDecrement}
        size="sm"
        variant="secondary"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div>
        <input
          className={styles.numberInput}
          onChange={handleInputChange}
          onFocus={event => event.target.select()}
          type="number"
          value={value}
        />
      </div>

      <Button
        className="h-8 w-8 bg-white p-0 hover:bg-white/80"
        onClick={onIncrement}
        size="sm"
        variant="secondary"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
