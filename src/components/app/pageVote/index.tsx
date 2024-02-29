import { UserActionRowCTAsListWithApi } from '@/components/app/userActionRowCTA/userActionRowCTAsListWithApi'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageProps } from '@/types'
import { ActiveClientUserActionType } from '@/utils/shared/activeUserAction'
import { getIntlUrls } from '@/utils/shared/urls'

const EXCLUDE_USER_ACTION_TYPES: ActiveClientUserActionType[] = ['NFT_MINT', 'CALL', 'EMAIL']

export function PageVote({ params }: PageProps) {
  const { locale } = params
  const intlUrls = getIntlUrls(locale)

  return (
    <div className="container flex flex-col items-center justify-center gap-10">
      <div className="flex flex-col items-center justify-center gap-6">
        <PageTitle>Voter guide</PageTitle>
        <PageSubTitle>
          With the future of crypto in America uncertain, it's up to us to take action, as the fate
          of crypto lies in our hands. Explore these resources to make informed decisions at the
          ballot box and support candidates who advocate for crypto policies.
        </PageSubTitle>
      </div>

      <Button asChild size="lg">
        <InternalLink href={intlUrls.politiciansHomepage()}>Find your representative</InternalLink>
      </Button>
      <UserActionRowCTAsListWithApi excludeUserActionTypes={EXCLUDE_USER_ACTION_TYPES} />
    </div>
  )
}
