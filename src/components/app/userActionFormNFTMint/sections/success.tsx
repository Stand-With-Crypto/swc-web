'use client'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { UseSectionsReturn } from '@/hooks/useSections'
import { UserActionFormNFTMintSectionNames } from '@/components/app/userActionFormNFTMint'
import { Button } from '@/components/ui/button'
import { MINT_NFT_CONTRACT_ADDRESS } from '@/components/app/userActionFormNFTMint/constants'
import { useThirdwebContractMetadata } from '@/hooks/useThirdwebContractMetadata'
import { UseCheckoutControllerReturn } from '@/components/app/userActionFormNFTMint/useCheckoutController'

export function UserActionFormNFTMintSuccess({
  goToSection,
  totalFeeDisplay: _totalFeeDisplay,
}: UseSectionsReturn<UserActionFormNFTMintSectionNames> &
  Pick<UseCheckoutControllerReturn, 'totalFeeDisplay'>) {
  const { session } = useThirdwebData()
  const { data: _contractMetadata, isLoading: isLoadingContractMetadata } =
    useThirdwebContractMetadata(MINT_NFT_CONTRACT_ADDRESS)

  return (
    <UserActionFormLayout>
      {(session.isLoading || isLoadingContractMetadata) && <LoadingOverlay />}
      <UserActionFormLayout.Container>
        <UserActionFormLayout.Footer>
          <Button onClick={() => goToSection(UserActionFormNFTMintSectionNames.CHECKOUT)} size="lg">
            Back
          </Button>
        </UserActionFormLayout.Footer>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
