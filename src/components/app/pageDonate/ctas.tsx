import { UserActionType } from '@prisma/client'

import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

const EXCLUDE_USER_ACTION_TYPES: UserActionType[] = ['NFT_MINT', 'DONATION']

export function CTAs() {
  return (
    <section className="space-y-7">
      <PageTitle as="h2" size="sm">
        Other ways to contribute
      </PageTitle>
      <PageSubTitle className="text-base">
        Do your part to help protect crypto without opening your wallet.
      </PageSubTitle>

      <UserActionGridCTAs
        className="lg:grid-cols-3"
        excludeUserActionTypes={EXCLUDE_USER_ACTION_TYPES}
      />
    </section>
  )
}
