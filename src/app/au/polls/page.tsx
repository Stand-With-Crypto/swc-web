import { isEmpty } from 'lodash-es'
import { Metadata } from 'next'

import { PagePolls } from '@/components/app/pagePolls'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getCurrentPollsData } from '@/utils/server/polls/getCurrentPollsData'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.AU

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
  const { activePolls, inactivePolls, initialPollsResultsData } = await getCurrentPollsData({
    countryCode,
  })

  const hasPolls = !isEmpty(activePolls) || !isEmpty(inactivePolls)

  return (
    <PagePolls initialPollsResultsData={initialPollsResultsData}>
      <PagePolls.Header description={description} hasPolls={hasPolls} title={title} />
      <PagePolls.ActivePollsAndResults activePolls={activePolls} />
      <PagePolls.InactivePollsResults inactivePolls={inactivePolls} />
    </PagePolls>
  )
}
