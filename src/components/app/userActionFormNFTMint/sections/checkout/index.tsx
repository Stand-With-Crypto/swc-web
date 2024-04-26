import React from 'react'
import Balancer from 'react-wrap-balancer'
import {
  useConnectionStatus,
  useContract,
  useContractMetadata,
  Web3Button,
} from '@thirdweb-dev/react'
import { noop } from 'lodash-es'

import {
  NFTDisplay,
  NFTDisplaySkeleton,
  UserActionFormLayout,
} from '@/components/app/userActionFormCommon'
import {
  MINT_NFT_CONTRACT_ADDRESS,
  UserActionFormNFTMintSectionNames,
} from '@/components/app/userActionFormNFTMint/constants'
import {
  CheckoutError,
  useCheckoutError,
} from '@/components/app/userActionFormNFTMint/sections/checkout/useCheckoutError'
import { UseCheckoutControllerReturn } from '@/components/app/userActionFormNFTMint/useCheckoutController'
import { Button } from '@/components/ui/button'
import { Card, CardSkeleton } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { ErrorMessage } from '@/components/ui/errorMessage'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'
import { UseSectionsReturn } from '@/hooks/useSections'
import { MintStatus } from '@/hooks/useSendMintNFTTransaction'
import { useThirdwebAddress } from '@/hooks/useThirdwebAddress'
import { SupportedCryptoCurrencyCodes } from '@/utils/shared/currency'
import { theme } from '@/utils/web/thirdweb/theme'

import { QuantityInput } from './quantityInput'

interface UserActionFormNFTMintCheckoutProps
  extends UseSectionsReturn<UserActionFormNFTMintSectionNames>,
    UseCheckoutControllerReturn {
  onMint: () => void
  mintStatus: MintStatus
  isUSResident: boolean
  onIsUSResidentChange: (newValue: boolean) => void
  debug?: boolean
}

const CHECKOUT_ERROR_TO_MESSAGE: Record<CheckoutError, string> = {
  insufficientFunds: 'Insufficient funds. You need ETH on Base to mint',
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
  isUSResident,
  onIsUSResidentChange,
  debug = false,
}: UserActionFormNFTMintCheckoutProps) {
  const { contract } = useContract(MINT_NFT_CONTRACT_ADDRESS)
  const { data: contractMetadata, isLoading: isLoadingMetadata } = useContractMetadata(contract)
  const address = useThirdwebAddress()

  const checkoutError = useCheckoutError({
    totalFee: totalFee,
    contractChainId: contract?.chainId,
  })
  const maybeOverriddenCheckoutError = debug ? null : checkoutError
  const connectionStatus = useConnectionStatus()

  if (!contractMetadata || isLoadingMetadata || !address) {
    return <UserActionFormNFTMintCheckoutSkeleton />
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

            <PageSubTitle className="text-start">on Base</PageSubTitle>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-center justify-between gap-2">
              <p>Quantity</p>
              <QuantityInput
                onChange={setQuantity}
                onDecrement={decrementQuantity}
                onIncrement={incrementQuantity}
                value={quantity}
              />
            </div>
          </Card>

          {!totalFeeDisplay ? (
            <CardSkeleton>
              <div className="space-y-8">
                {Array.from({ length: 3 }, (_, i) => (
                  <div className="flex items-center justify-between gap-2" key={i}>
                    <div className="max-w-96 text-sm md:text-base">
                      <p className="text-xs text-muted-foreground">
                        <Balancer>Loading...</Balancer>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardSkeleton>
          ) : (
            <Card className="w-full">
              <div className="space-y-8">
                <div className="flex items-center justify-between gap-2 text-sm md:text-base">
                  <div className="max-w-96">
                    <p>Donation</p>
                    <p className="text-xs text-muted-foreground">
                      <Balancer>
                        {mintFeeDisplay}
                        {SupportedCryptoCurrencyCodes.ETH} of the mint fee will be donated to Stand
                        With Crypto Alliance, Inc. (SWCA). Donations from foreign nationals and
                        government contractors are prohibited.
                      </Balancer>
                    </p>
                  </div>

                  <CurrencyDisplay value={mintFeeDisplay} />
                </div>

                <div className="flex items-center justify-between gap-2 text-sm md:text-base">
                  <p>Gas fee</p>
                  <CurrencyDisplay value={gasFeeDisplay} />
                </div>

                <div className="flex items-center justify-between gap-2 text-sm md:text-base">
                  <p>Total</p>
                  <CurrencyDisplay value={totalFeeDisplay} />
                </div>
              </div>
            </Card>
          )}
        </div>

        <Collapsible open={!maybeOverriddenCheckoutError}>
          <CollapsibleContent className="AnimateCollapsibleContent">
            <label className="flex cursor-pointer items-center gap-4">
              <Checkbox
                checked={isUSResident}
                onCheckedChange={val => onIsUSResidentChange(val as boolean)}
              />
              <p className="text-sm leading-4 text-fontcolor-muted md:text-base">
                I am a US citizen or lawful permanent resident (i.e. a green card holder). Checking
                this box will append data to your onchain transaction to comply with US regulation.
                Donations from non-US residents cannot be used for electioneering purposes.
              </p>
            </label>
          </CollapsibleContent>
        </Collapsible>

        <UserActionFormLayout.Footer className="!mt-auto">
          {debug ? (
            <Button
              onClick={() => goToSection(UserActionFormNFTMintSectionNames.TRANSACTION_WATCH)}
              size="lg"
            >
              Mint now - Mocked
            </Button>
          ) : (
            <Web3Button
              action={onMint}
              className="!rounded-full disabled:pointer-events-none disabled:opacity-50"
              contractAddress={MINT_NFT_CONTRACT_ADDRESS}
              isDisabled={
                isLoading ||
                (!!maybeOverriddenCheckoutError &&
                  maybeOverriddenCheckoutError !== 'networkSwitch') ||
                (!isLoading && !maybeOverriddenCheckoutError && !totalFeeDisplay)
              }
              theme={theme}
            >
              Mint now
            </Web3Button>
          )}

          {!!maybeOverriddenCheckoutError && !isLoading && (
            <ErrorMessage>{CHECKOUT_ERROR_TO_MESSAGE[maybeOverriddenCheckoutError]}</ErrorMessage>
          )}
        </UserActionFormLayout.Footer>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

function UserActionFormNFTMintCheckoutSkeleton() {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <div className="flex gap-6">
          <NFTDisplaySkeleton size="sm" />

          <div>
            <Skeleton>
              <PageTitle className="text-start" size="sm">
                Stand With Crypto Supporter
              </PageTitle>
            </Skeleton>

            <Skeleton>
              <PageSubTitle className="text-start">on Base</PageSubTitle>
            </Skeleton>
          </div>
        </div>

        <CardSkeleton>
          <div className="flex items-center justify-between gap-2">
            <p>Quantity</p>
            <QuantityInput onChange={noop} onDecrement={noop} onIncrement={noop} value={0} />
          </div>
        </CardSkeleton>

        <CardSkeleton>
          <div className="space-y-8">
            {Array.from({ length: 3 }, (_, i) => (
              <div className="flex items-center justify-between gap-2" key={i}>
                <div className="max-w-96 text-sm md:text-base">
                  <p>Donation</p>
                  <p className="text-xs text-muted-foreground">
                    <Balancer>Lorem ipsum dolor sit amet consectetur adipisicing elit.</Balancer>
                  </p>
                </div>
                <CurrencyDisplay value="0.00435" />
              </div>
            ))}
          </div>
        </CardSkeleton>

        <UserActionFormLayout.Footer>
          <Skeleton>
            <Button size="lg">Mint now</Button>
          </Skeleton>
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
