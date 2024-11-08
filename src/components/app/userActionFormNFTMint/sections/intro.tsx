'use client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { MaybeAuthenticatedContent } from '@/components/app/authentication/maybeAuthenticatedContent'
import {
  NFTDisplay,
  NFTDisplaySkeleton,
  UserActionFormLayout,
} from '@/components/app/userActionFormCommon'
import {
  ETH_NFT_DONATION_AMOUNT,
  UserActionFormNFTMintSectionNames,
} from '@/components/app/userActionFormNFTMint/constants'
import { Button } from '@/components/ui/button'
import { DialogBody } from '@/components/ui/dialog'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'
import { UseSectionsReturn } from '@/hooks/useSections'
import { fromBigNumber } from '@/utils/shared/bigNumber'
import { SupportedCryptoCurrencyCodes } from '@/utils/shared/currency'
import { NFTSlug } from '@/utils/shared/nft'
import { NFT_CLIENT_METADATA, NFTClientMetadata } from '@/utils/web/nft'

export function UserActionFormNFTMintIntro({
  goToSection,
}: UseSectionsReturn<UserActionFormNFTMintSectionNames>) {
  const contractMetadata = NFT_CLIENT_METADATA[NFTSlug.STAND_WITH_CRYPTO_SUPPORTER]

  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <div className="flex h-full flex-col gap-6">
          <DialogBody>
            <ContractMetadataDisplay contractMetadata={contractMetadata} />
          </DialogBody>

          <UserActionFormLayout.Footer>
            <LoginDialogWrapper
              authenticatedContent={
                <Button
                  onClick={() => goToSection(UserActionFormNFTMintSectionNames.CHECKOUT)}
                  size="lg"
                >
                  Continue
                </Button>
              }
              loadingFallback={<FooterSkeleton />}
              useThirdwebSession={true}
            >
              <Button data-testid="signin-button" size="lg">
                Sign In
              </Button>
            </LoginDialogWrapper>
            <MaybeAuthenticatedContent authenticatedContent={null} useThirdwebSession={true}>
              <p className="text-xs text-muted-foreground md:text-sm">
                You will need to login first to mint the NFT
              </p>
            </MaybeAuthenticatedContent>
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

function ContractMetadataDisplay({ contractMetadata }: { contractMetadata: NFTClientMetadata }) {
  return (
    <div className="flex flex-grow flex-col gap-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <NFTDisplay
          alt={contractMetadata.image.alt}
          raw
          size="lg"
          src={contractMetadata.image.url}
        />
        <div className="space-y-2">
          <PageTitle className="text-start" size="md">
            {contractMetadata.name}
          </PageTitle>

          <div>
            <PageSubTitle className="text-start">
              <strong className="text-primary">{ETH_NFT_DONATION_AMOUNT_DISPLAY}</strong>
              <br />
              on Base
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
      <div className="flex flex-col gap-6 md:flex-row">
        <NFTDisplaySkeleton size="lg" />
        <div className="space-y-2">
          <Skeleton>
            <PageTitle className="text-start" size="md">
              Stand With Crypto Supporter
            </PageTitle>
          </Skeleton>

          <div>
            <Skeleton>
              <PageSubTitle className="text-start">
                <strong className="text-primary">{ETH_NFT_DONATION_AMOUNT_DISPLAY}</strong>
                <br />
                on Base
              </PageSubTitle>
            </Skeleton>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Skeleton>
          <p className="text-lg text-muted-foreground">
            This collectible commemorates the launch of the Stand With Crypto Alliance on August 14,
            2023. Priced at {ETH_NFT_DONATION_AMOUNT_DISPLAY}, this represents the 435 congressional
            districts in the U.S. All proceeds benefit the Alliance. Secure yours on
            standwithcrypto.org.
          </p>
        </Skeleton>
      </div>
    </>
  )
}
