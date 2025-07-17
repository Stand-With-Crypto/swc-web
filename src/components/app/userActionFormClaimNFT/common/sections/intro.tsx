'use client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import {
  NFTDisplay,
  NFTDisplaySkeleton,
  UserActionFormLayout,
} from '@/components/app/userActionFormCommon'
import { Button, ButtonProps } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/hooks/useSession'
import { NFTClientMetadata } from '@/utils/web/nft'
import { noop } from 'lodash-es'

export function ClaimNFTIntro({ children }: { children: React.ReactNode }) {
  return (
    <UserActionFormLayout className="min-h-[200px]">
      <UserActionFormLayout.Container>{children}</UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

interface ContractMetadataDisplayProps {
  contractMetadata: NFTClientMetadata
  subtitle?: string
}
ClaimNFTIntro.ContractMetadataDisplay = function ContractMetadataDisplay({
  contractMetadata,
  subtitle,
}: ContractMetadataDisplayProps) {
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
          {subtitle && <PageSubTitle className="text-start">{subtitle}</PageSubTitle>}
          {contractMetadata.description && (
            <p className="text-justify text-lg text-muted-foreground">
              {contractMetadata.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface FooterProps {
  children: React.ReactNode
  disclaimer?: React.ReactNode
}
ClaimNFTIntro.Footer = function Footer({ children, disclaimer }: FooterProps) {
  const session = useSession()

  return (
    <UserActionFormLayout.Footer className="gap-8">
      {children}

      <div className="flex flex-col justify-center gap-2 text-xs text-muted-foreground md:text-sm">
        {disclaimer ? <p>{disclaimer}</p> : null}

        {!session.isLoggedInThirdweb && !session.isLoading && (
          <p>You will need to login first to claim the NFT</p>
        )}
      </div>
    </UserActionFormLayout.Footer>
  )
}

ClaimNFTIntro.ClaimButton = function ClaimButton(props: ButtonProps) {
  return (
    <LoginDialogWrapper
      authenticatedContent={
        <Button size="lg" {...props}>
          Claim NFT
        </Button>
      }
      loadingFallback={<FooterSkeleton />}
      useThirdwebSession={true}
    >
      <Button data-testid="signin-button" size="lg" {...props} onClick={noop}>
        Sign In
      </Button>
    </LoginDialogWrapper>
  )
}

function FooterSkeleton() {
  return <Skeleton className="h-14 w-32" />
}

type ContractMetadataDisplaySkeletonProps = ContractMetadataDisplayProps

ClaimNFTIntro.ContractMetadataDisplaySkeleton = function ContractMetadataDisplaySkeleton({
  contractMetadata,
  subtitle,
}: ContractMetadataDisplaySkeletonProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <NFTDisplaySkeleton size="lg" />
      <div className="space-y-2">
        <Skeleton>
          <PageTitle className="text-start" size="md">
            {contractMetadata.name}
          </PageTitle>
          {subtitle && (
            <Skeleton>
              <PageSubTitle className="text-start">{subtitle}</PageSubTitle>
            </Skeleton>
          )}
        </Skeleton>
        <Skeleton>
          <p className="text-lg text-muted-foreground">{contractMetadata.description}</p>
        </Skeleton>
      </div>
    </div>
  )
}
