import { UserActionType } from '@prisma/client'
import { Metadata } from 'next'

import { PagePolls } from '@/components/app/pagePolls'
import { USER_ACTION_CTAS_FOR_GRID_DISPLAY } from '@/components/app/userActionGridCTAs/constants/ctas'
import { getPollsResultsData } from '@/data/polls/getPollsData'
import { getPolls } from '@/utils/server/builder/models/data/polls'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SWCPoll } from '@/utils/shared/zod/getSWCPolls'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'

const title = 'Crypto Polls'
const description = 'Answer polls to help shape the future of crypto regulation'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function PollsPage() {
  const builderIoPolls = await getPolls()
  const pollsResultsData = await getPollsResultsData()

  const activePolls = USER_ACTION_CTAS_FOR_GRID_DISPLAY[UserActionType.POLL].campaigns
    .filter(campaign => campaign.isCampaignActive)
    .map(campaign => builderIoPolls?.find(poll => poll.id === campaign.campaignName))
    .filter(Boolean) as SWCPoll[] | null

  const inactivePolls = USER_ACTION_CTAS_FOR_GRID_DISPLAY[UserActionType.POLL].campaigns
    .filter(campaign => !campaign.isCampaignActive)
    .map(campaign => builderIoPolls?.find(poll => poll.id === campaign.campaignName))
    .filter(Boolean) as SWCPoll[] | null

  return (
    <PagePolls
      activePolls={activePolls}
      description={description}
      inactivePolls={inactivePolls}
      pollsResultsData={pollsResultsData}
      title={title}
    />
  )
}
