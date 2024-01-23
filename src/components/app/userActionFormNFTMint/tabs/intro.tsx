'use client'

import { ValidContractInstance } from '@thirdweb-dev/react'

import { UnauthenticatedSessionButton } from '@/components/app/unauthenticatedSessionButton'
import {
  UserActionFormLayout,
  NFTDisplay,
  NFTDisplaySkeleton,
} from '@/components/app/userActionFormCommon'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { UseTabsReturn } from '@/hooks/useTabs'
import { UserActionFormNFTMintTabNames } from '@/components/app/userActionFormNFTMint'
import { Button } from '@/components/ui/button'
import {
  NFT_DONATION_AMOUNT,
  MINT_NFT_CONTRACT_ADDRESS,
} from '@/components/app/userActionFormNFTMint/constants'
import { SupportedCryptoCurrencyCodes } from '@/utils/shared/currency'
import { Skeleton } from '@/components/ui/skeleton'
import { useThirdwebContractMetadata } from '@/hooks/useThirdwebContractMetadata'

export function UserActionFormNFTMintIntro({
  gotoTab,
}: UseTabsReturn<UserActionFormNFTMintTabNames>) {
  const { session } = useThirdwebData()
  const { data: contractMetadata, isLoading: isLoadingContractMetadata } =
    useThirdwebContractMetadata(MINT_NFT_CONTRACT_ADDRESS)

  return (
    <UserActionFormLayout>
      {(session.isLoading || isLoadingContractMetadata) && <LoadingOverlay />}
      <UserActionFormLayout.Container>
        <ContractMetadataDisplay contractMetadata={contractMetadata} />

        <UserActionFormLayout.Footer>
          {session.isLoggedIn ? (
            <Button onClick={() => gotoTab(UserActionFormNFTMintTabNames.CHECKOUT)} size="lg">
              Continue
            </Button>
          ) : (
            <UnauthenticatedSessionButton variant="primary" />
          )}

          {!session.isLoggedIn && (
            <p className="text-sm text-muted-foreground">
              You will need to login first to mint the NFT
            </p>
          )}
        </UserActionFormLayout.Footer>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

function ContractMetadataDisplay({
  contractMetadata,
}: {
  contractMetadata?: Awaited<ReturnType<ValidContractInstance['metadata']['get']>>
}) {
  if (!contractMetadata) {
    return <ContractMetadataDisplaySkeleton />
  }

  return (
    <>
      <div className="flex gap-6">
        <NFTDisplay
          size="lg"
          src={contractMetadata?.image ?? ''}
          alt="Stand with Crypto supporter NFT"
          raw
        />
        <div className="space-y-2">
          <PageTitle size="sm" className="text-start">
            {contractMetadata.name}
          </PageTitle>

          <div>
            <PageSubTitle className="text-start">
              <strong className="text-primary">
                {NFT_DONATION_AMOUNT} {SupportedCryptoCurrencyCodes.ETH}
              </strong>
              <br />
              on Base Network
            </PageSubTitle>
          </div>
        </div>
      </div>

      <p className="text-lg text-muted-foreground">{contractMetadata.description}</p>
    </>
  )
}

export function ContractMetadataDisplaySkeleton() {
  return (
    <>
      <div className="flex gap-6">
        <NFTDisplaySkeleton size="lg" />
        <div className="space-y-2">
          <Skeleton>
            <PageTitle size="sm" className="text-start">
              Stand With Crypto Supporter
            </PageTitle>
          </Skeleton>

          <div>
            <Skeleton>
              <PageSubTitle className="text-start">
                <strong className="text-primary">
                  {NFT_DONATION_AMOUNT} {SupportedCryptoCurrencyCodes.ETH}
                </strong>
                <br />
                on Base Network
              </PageSubTitle>
            </Skeleton>
          </div>
        </div>
      </div>

      <Skeleton>
        <p className="text-lg text-muted-foreground">
          This collectible commemorates the launch of the Stand With Crypto Alliance on August 14,
          2023. Priced at {NFT_DONATION_AMOUNT} {SupportedCryptoCurrencyCodes.ETH}, this represents
          the 435 congressional districts in the U.S. All proceeds benefit the Alliance. Secure
          yours on standwithcrypto.org.
        </p>
      </Skeleton>
    </>
  )
}
