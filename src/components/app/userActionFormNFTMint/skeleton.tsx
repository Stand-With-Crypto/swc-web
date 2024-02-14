import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import {
  ContractMetadataDisplaySkeleton,
  FooterSkeleton,
} from '@/components/app/userActionFormNFTMint/sections/intro'

export function UserActionFormNFTMintSkeleton() {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <ContractMetadataDisplaySkeleton />

        <UserActionFormLayout.Footer>
          <FooterSkeleton />
        </UserActionFormLayout.Footer>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
