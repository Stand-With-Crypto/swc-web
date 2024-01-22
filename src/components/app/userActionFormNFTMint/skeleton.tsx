'use client'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { ContractMetadataDisplaySkeleton } from '@/components/app/userActionFormNFTMint/tabs/intro'
import { Button } from '@/components/ui/button'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { Skeleton } from '@/components/ui/skeleton'

export function UserActionFormNFTMintSkeleton() {
  return (
    <UserActionFormLayout>
      <LoadingOverlay />
      <UserActionFormLayout.Container>
        <ContractMetadataDisplaySkeleton />

        <UserActionFormLayout.Footer>
          <Button>
            <Skeleton>Login</Skeleton>
          </Button>

          <p className="text-sm text-muted-foreground">
            You will need to login first to mint the NFT
          </p>
        </UserActionFormLayout.Footer>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
