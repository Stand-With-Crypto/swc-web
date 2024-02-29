import { UserActionRowCTAsListWithApi } from '@/components/app/userActionRowCTA/userActionRowCTAsListWithApi'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ActiveClientUserActionType } from '@/utils/shared/activeUserAction'

const EXCLUDE_USER_ACTION_TYPES: ActiveClientUserActionType[] = ['NFT_MINT', 'DONATION']

export function CTAs() {
  return (
    <section className="space-y-7">
      <PageTitle as="h2" size="sm">
        Other ways to contribute
      </PageTitle>
      <PageSubTitle className="text-base">
        Do your part to help protect crypto without opening your wallet.
      </PageSubTitle>

      <UserActionRowCTAsListWithApi excludeUserActionTypes={EXCLUDE_USER_ACTION_TYPES} />
    </section>
  )
}
