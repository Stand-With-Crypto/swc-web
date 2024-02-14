'use client'

import { ValidContractInstance } from '@thirdweb-dev/react'

import { MaybeAuthenticatedContent } from '@/components/app/authentication/maybeAuthenticatedContent'
import { ThirdwebLoginDialog } from '@/components/app/authentication/thirdwebLoginContent'
import {
  NFTDisplay,
  NFTDisplaySkeleton,
  UserActionFormLayout,
} from '@/components/app/userActionFormCommon'
import {
  ETH_NFT_DONATION_AMOUNT,
  MINT_NFT_CONTRACT_ADDRESS,
  UserActionFormNFTMintSectionNames,
} from '@/components/app/userActionFormNFTMint/constants'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'
import { UseSectionsReturn } from '@/hooks/useSections'
import { useThirdwebContractMetadata } from '@/hooks/useThirdwebContractMetadata'
import { fromBigNumber } from '@/utils/shared/bigNumber'
import { SupportedCryptoCurrencyCodes } from '@/utils/shared/currency'

export function UserActionFormNFTMintIntro({
  goToSection,
}: UseSectionsReturn<UserActionFormNFTMintSectionNames>) {
  const { data: contractMetadata, isLoading: isLoadingContractMetadata } =
    useThirdwebContractMetadata(MINT_NFT_CONTRACT_ADDRESS)

  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <div className="flex h-full flex-col gap-6">
          <ContractMetadataDisplay contractMetadata={contractMetadata} />

          <UserActionFormLayout.Footer>
            {isLoadingContractMetadata ? (
              <FooterSkeleton />
            ) : (
              <MaybeAuthenticatedContent
                authenticatedContent={
                  <Button
                    onClick={() => goToSection(UserActionFormNFTMintSectionNames.CHECKOUT)}
                    size="lg"
                  >
                    Continue
                  </Button>
                }
                loadingFallback={<FooterSkeleton />}
              >
                <ThirdwebLoginDialog>
                  <Button size="lg">Log In</Button>
                </ThirdwebLoginDialog>

                <p className="text-sm text-muted-foreground">
                  You will need to login first to mint the NFT
                </p>
              </MaybeAuthenticatedContent>
            )}
          </UserActionFormLayout.Footer>
        </div>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

export function FooterSkeleton() {
  return <Skeleton className="h-12 w-full" />
}

const ETH_NFT_DONATION_AMOUNT_DISPLAY = `${fromBigNumber(ETH_NFT_DONATION_AMOUNT)} ${
  SupportedCryptoCurrencyCodes.ETH
}`

function ContractMetadataDisplay({
  contractMetadata,
}: {
  contractMetadata?: Awaited<ReturnType<ValidContractInstance['metadata']['get']>>
}) {
  if (!contractMetadata) {
    return <ContractMetadataDisplaySkeleton />
  }

  return (
    <div className="flex flex-grow flex-col gap-6">
      <div className="flex gap-6">
        <NFTDisplay
          alt="Stand with Crypto supporter NFT"
          raw
          size="lg"
          src={contractMetadata?.image ?? ''}
        />
        <div className="space-y-2">
          <PageTitle className="text-start" size="sm">
            {contractMetadata.name}
          </PageTitle>

          <div>
            <PageSubTitle className="text-start">
              <strong className="text-primary">{ETH_NFT_DONATION_AMOUNT_DISPLAY}</strong>
              <br />
              on Base Network
            </PageSubTitle>
          </div>
        </div>
      </div>

      {contractMetadata.description && (
        <p className="text-lg text-muted-foreground">{contractMetadata.description}</p>
      )}
    </div>
  )
}

export function ContractMetadataDisplaySkeleton() {
  return (
    <>
      <div className="flex gap-6">
        <NFTDisplaySkeleton size="lg" />
        <div className="space-y-2">
          <Skeleton>
            <PageTitle className="text-start" size="sm">
              Stand With Crypto Supporter
            </PageTitle>
          </Skeleton>

          <div>
            <Skeleton>
              <PageSubTitle className="text-start">
                <strong className="text-primary">{ETH_NFT_DONATION_AMOUNT_DISPLAY}</strong>
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
          2023. Priced at {ETH_NFT_DONATION_AMOUNT_DISPLAY}, this represents the 435 congressional
          districts in the U.S. All proceeds benefit the Alliance. Secure yours on
          standwithcrypto.org.
        </p>
      </Skeleton>
    </>
  )
}
