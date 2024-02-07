import { useSections } from '@/hooks/useSections'

import { UserActionFormNFTMintIntro } from './tabs/intro'
import { UserActionFormNFTMintCheckout } from './tabs/checkout'
import { UserActionFormNFTMintSuccess } from './tabs/success'
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
