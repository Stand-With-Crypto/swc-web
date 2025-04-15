import { UserActionType } from '@prisma/client'
import { Metadata } from 'next'

import { PagePolls } from '@/components/app/pagePolls'
import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { getPollsResultsData } from '@/data/polls/getPollsData'
import { getPolls } from '@/utils/server/builder/models/data/polls'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCPoll } from '@/utils/shared/zod/getSWCPolls'

const countryCode = SupportedCountryCodes.CA

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
  const builderIoPolls = await getPolls({ countryCode })
  const pollsResultsData = await getPollsResultsData({ countryCode })

  const ctas = getUserActionCTAsByCountry(countryCode)

  const activePolls = ctas[UserActionType.POLL].campaigns
    .filter(campaign => campaign.isCampaignActive)
    .map(campaign => builderIoPolls?.find(poll => poll.id === campaign.campaignName))
    .filter(Boolean) as SWCPoll[] | null

  const inactivePolls = ctas[UserActionType.POLL].campaigns
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
