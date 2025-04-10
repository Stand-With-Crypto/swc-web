import { UserActionType } from '@prisma/client'

import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

const EXCLUDE_USER_ACTION_TYPES: UserActionType[] = [
  UserActionType.NFT_MINT,
  UserActionType.DONATION,
]

export function CTAs() {
  return (
    <section className="space-y-7">
      <PageTitle as="h2" size="md">
        Other ways to contribute
      </PageTitle>
      <PageSubTitle className="text-base">
        Do your part to help protect crypto without opening your wallet.
      </PageSubTitle>

      <UserActionGridCTAs excludeUserActionTypes={EXCLUDE_USER_ACTION_TYPES} />
    </section>
  )
}
