import { Metadata } from 'next'

import { PagePolls } from '@/components/app/pagePolls'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getCurrentPollsData } from '@/utils/server/polls/getCurrentPollsData'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

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
  const { activePolls, inactivePolls, pollsResultsData } = await getCurrentPollsData({
    countryCode,
  })

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
