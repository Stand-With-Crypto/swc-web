import { useTabs } from '@/hooks/useTabs'

import { UserActionFormNFTMintIntro } from './tabs/intro'
import { UserActionFormNFTMintCheckout } from './tabs/checkout'

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

  switch (tabProps.currentTab) {
    case UserActionFormNFTMintTabNames.INTRO:
      return <UserActionFormNFTMintIntro {...tabProps} />

    case UserActionFormNFTMintTabNames.CHECKOUT:
      return <UserActionFormNFTMintCheckout {...tabProps} />

    case UserActionFormNFTMintTabNames.SUCCESS:
      return <>Success</>

    default:
      tabProps.onTabNotFound()
      return null
  }
}
