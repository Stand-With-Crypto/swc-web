'use client'

import { UnauthenticatedSessionButton } from '@/components/app/unauthenticatedSessionButton'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { UseTabsReturn } from '@/hooks/useTabs'
import { UserActionFormNFTMintTabNames } from '@/components/app/userActionFormNFTMint'
import { Button } from '@/components/ui/button'
import { MINT_NFT_CONTRACT_ADDRESS } from '@/components/app/userActionFormNFTMint/constants'
import { useThirdwebContractMetadata } from '@/hooks/useThirdwebContractMetadata'
import { UseCheckoutControllerReturn } from '@/components/app/userActionFormNFTMint/useCheckoutController'

export function UserActionFormNFTMintSuccess({
  gotoTab,
  totalFee: _totalFee,
}: UseTabsReturn<UserActionFormNFTMintTabNames> & Pick<UseCheckoutControllerReturn, 'totalFee'>) {
  const { session } = useThirdwebData()
  const { data: _contractMetadata, isLoading: isLoadingContractMetadata } =
    useThirdwebContractMetadata(MINT_NFT_CONTRACT_ADDRESS)

  return (
    <UserActionFormLayout>
      {(session.isLoading || isLoadingContractMetadata) && <LoadingOverlay />}
      <UserActionFormLayout.Container>
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
