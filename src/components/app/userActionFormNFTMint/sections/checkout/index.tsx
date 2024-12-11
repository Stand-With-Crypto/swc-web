import React, { Dispatch, SetStateAction, useState } from 'react'
import Balancer from 'react-wrap-balancer'
import { noop } from 'lodash-es'
import { TransactionReceipt } from 'node_modules/thirdweb/dist/types/transaction/types'
import { getContract, PreparedTransaction } from 'thirdweb'
import { base } from 'thirdweb/chains'
import { TransactionButton, useActiveWalletConnectionStatus } from 'thirdweb/react'

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
import { useSession } from '@/hooks/useSession'
import { SupportedCryptoCurrencyCodes } from '@/utils/shared/currency'
import { NFTSlug } from '@/utils/shared/nft'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'
import { theme } from '@/utils/web/thirdweb/theme'

import { QuantityInput } from './quantityInput'

interface UserActionFormNFTMintCheckoutProps
  extends UseSectionsReturn<UserActionFormNFTMintSectionNames>,
    UseCheckoutControllerReturn {
  prepareTransaction: () => PreparedTransaction | Promise<PreparedTransaction>
  onMintCallback?: (receipt: TransactionReceipt) => void
  setTransactionHash: Dispatch<SetStateAction<string | null>>
  handleTransactionException: (e: unknown, extra: Record<string, unknown>) => void
  debug?: boolean
}

const CHECKOUT_ERROR_TO_MESSAGE: Record<CheckoutError, string> = {
  insufficientFunds: 'Insufficient funds. You need ETH on Base to mint',
  networkSwitch: 'Please switch to the Base Network',
  connectWallet: 'Please connect your wallet to mint',
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
  prepareTransaction,
  onMintCallback,
  handleTransactionException,
  setTransactionHash,
  debug = false,
}: UserActionFormNFTMintCheckoutProps) {
  const contract = getContract({
    address: MINT_NFT_CONTRACT_ADDRESS,
    client: thirdwebClient,
    chain: base,
  })
  const contractMetadata = NFT_CLIENT_METADATA[NFTSlug.STAND_WITH_CRYPTO_SUPPORTER]
  const session = useSession()
  const [isUSResident, setIsUSResident] = useState(false)

  const checkoutError = useCheckoutError({
    totalFee: totalFee,
    contractChainId: contract.chain.id,
  })
  const maybeOverriddenCheckoutError = debug ? null : checkoutError
  const connectionStatus = useActiveWalletConnectionStatus()

  if (!session.isLoggedInThirdweb) {
    return <UserActionFormNFTMintCheckoutSkeleton />
  }

  const isLoading = !contract || connectionStatus === 'connecting'

  return (
    <UserActionFormLayout onBack={() => goToSection(UserActionFormNFTMintSectionNames.INTRO)}>
      {isLoading && <LoadingOverlay />}
      <UserActionFormLayout.Container>
        <div className="flex gap-6">
          <NFTDisplay
            alt={contractMetadata.image.alt}
            raw
            size="sm"
            src={contractMetadata.image.url}
          />

          <div>
            <PageTitle className="text-start" size="md">
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
                onChange={(newValue: number) => setQuantity(Math.floor(newValue))}
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
                onCheckedChange={val => setIsUSResident(val as boolean)}
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
              onClick={() => goToSection(UserActionFormNFTMintSectionNames.SUCCESS)}
              size="lg"
            >
              Mint now - Mocked
            </Button>
          ) : (
            <TransactionButton
              className="!rounded-full disabled:pointer-events-none disabled:opacity-50"
              disabled={
                isLoading ||
                (!!maybeOverriddenCheckoutError &&
                  maybeOverriddenCheckoutError !== 'networkSwitch') ||
                (!isLoading && !maybeOverriddenCheckoutError && !totalFeeDisplay)
              }
              onError={e => handleTransactionException(e, { isUSResident })}
              onTransactionConfirmed={onMintCallback}
              onTransactionSent={result => {
                setTransactionHash(result.transactionHash)
                goToSection(UserActionFormNFTMintSectionNames.TRANSACTION_WATCH)
              }}
              theme={theme}
              transaction={prepareTransaction}
            >
              Mint now
            </TransactionButton>
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
              <PageTitle className="text-start" size="md">
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
