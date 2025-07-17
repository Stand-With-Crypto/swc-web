import { ClaimNFTIntro } from '@/components/app/userActionFormClaimNFT/common/sections/intro'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { NFTSlug } from '@/utils/shared/nft'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

interface UserActionFormClaimNFTSkeletonProps {
  nftSlug: NFTSlug
}

export function UserActionFormClaimNFTSkeleton({ nftSlug }: UserActionFormClaimNFTSkeletonProps) {
  return (
    <ClaimNFTIntro>
      <UserActionFormLayout.Container>
        <ClaimNFTIntro.ContractMetadataDisplaySkeleton
          contractMetadata={NFT_CLIENT_METADATA[nftSlug]}
        />
        <ClaimNFTIntro.Footer>
          <ClaimNFTIntro.ClaimButton disabled />
        </ClaimNFTIntro.Footer>
      </UserActionFormLayout.Container>
    </ClaimNFTIntro>
  )
}
