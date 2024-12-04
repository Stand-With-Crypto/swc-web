import { UserActionType } from '@prisma/client'

import { UserActionRowCTAsListWithApi } from '@/components/app/userActionRowCTA/userActionRowCTAsListWithApi'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'

const EXCLUDE_USER_ACTION_TYPES: UserActionType[] = ['NFT_MINT', 'CALL', 'EMAIL']

export async function PageVote({ params }: PageProps) {
  const { locale } = await params
  const intlUrls = getIntlUrls(locale)

  return (
    <div className="standard-spacing-from-navbar container flex flex-col items-center justify-center gap-10">
      <div className="flex flex-col items-center justify-center gap-6">
        <PageTitle>Voter guide</PageTitle>
        <PageSubTitle>
          With the future of crypto in America uncertain, it's up to us to take action, as the fate
          of crypto lies in our hands. Explore these resources to learn what our leaders are saying
          about crypto and to help you make informed decisions at the ballot box.
        </PageSubTitle>
      </div>

      <Button asChild size="lg">
        <InternalLink href={intlUrls.politiciansHomepage()}>Find your representative</InternalLink>
      </Button>
      <UserActionRowCTAsListWithApi excludeUserActionTypes={EXCLUDE_USER_ACTION_TYPES} />
    </div>
  )
}
