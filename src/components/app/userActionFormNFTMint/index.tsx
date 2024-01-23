import { useTabs } from '@/hooks/useTabs'

import { UserActionFormNFTMintIntro } from './tabs/intro'
import { UserActionFormNFTMintCheckout } from './tabs/checkout'
import { UserActionFormNFTMintSuccess } from './tabs/success'
import { useCheckoutController } from './useCheckoutController'

export enum UserActionFormNFTMintTabNames {
  INTRO = 'intro',
  CHECKOUT = 'checkout',
  SUCCESS = 'success',
}

export function UserActionFormNFTMint(_props: { onCancel: () => void; onSuccess: () => void }) {
  const tabProps = useTabs({
    tabs: Object.values(UserActionFormNFTMintTabNames),
    initialTabId: UserActionFormNFTMintTabNames.INTRO,
  })

  const checkoutController = useCheckoutController()

  switch (tabProps.currentTab) {
    case UserActionFormNFTMintTabNames.INTRO:
      return <UserActionFormNFTMintIntro {...tabProps} />

    case UserActionFormNFTMintTabNames.CHECKOUT:
      return <UserActionFormNFTMintCheckout {...tabProps} {...checkoutController} />

    case UserActionFormNFTMintTabNames.SUCCESS:
      return <UserActionFormNFTMintSuccess {...tabProps} totalFee={checkoutController.totalFee} />

    default:
      tabProps.onTabNotFound()
      return null
  }
}
