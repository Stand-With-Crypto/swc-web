import { useSections } from '@/hooks/useSections'

import { UserActionFormNFTMintIntro } from './sections/intro'
import { UserActionFormNFTMintCheckout } from './sections/checkout'
import { UserActionFormNFTMintSuccess } from './sections/success'
import { useCheckoutController } from './useCheckoutController'

export enum UserActionFormNFTMintSectionNames {
  INTRO = 'intro',
  CHECKOUT = 'checkout',
  SUCCESS = 'success',
}
export function UserActionFormNFTMint(_props: { onCancel: () => void; onSuccess: () => void }) {
  const sectionProps = useSections({
    sections: Object.values(UserActionFormNFTMintSectionNames),
    initialSectionId: UserActionFormNFTMintSectionNames.INTRO,
    analyticsName: 'User Action Form NFT Mint',
  })

  const checkoutController = useCheckoutController()

  switch (sectionProps.currentSection) {
    case UserActionFormNFTMintSectionNames.INTRO:
      return <UserActionFormNFTMintIntro {...sectionProps} />

    case UserActionFormNFTMintSectionNames.CHECKOUT:
      return <UserActionFormNFTMintCheckout {...sectionProps} {...checkoutController} />

    case UserActionFormNFTMintSectionNames.SUCCESS:
      return (
        <UserActionFormNFTMintSuccess {...sectionProps} totalFee={checkoutController.totalFee} />
      )

    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
