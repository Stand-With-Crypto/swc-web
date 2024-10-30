import * as Sentry from '@sentry/nextjs'
import { Metadata } from 'next'

import { LocationCongressLiveResults } from '@/components/app/pageLocationKeyRaces/locationCongressLiveResults'
import { GetAllCongressDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getCongressLiveResultData } from '@/data/pageSpecific/getKeyRacesPageData'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const dynamic = 'error'
export const revalidate = SECONDS_DURATION['30_SECONDS']

const title = 'U.S. Congress Live Election Results'
const description =
  '2024 will be a monumental election year and Congress holds the power to shape the future of crypto in the U.S.'
export const metadata: Metadata = {
  ...generateMetadataDetails({
    description,
    title,
  }),
}

export default async function CongressLiveResults({ params: { locale } }: PageProps) {
  let congressRaceLiveResult: GetAllCongressDataResponse = {
    senateDataWithDtsi: null,
    houseDataWithDtsi: null,
  }
  const [congressResult] = await Promise.allSettled([getCongressLiveResultData()])
  if (congressResult.status === 'fulfilled') {
    congressRaceLiveResult = congressResult.value
  } else {
    Sentry.captureException(congressResult.reason, {
      extra: { keys: ['SWC_ALL_SENATE_DATA', 'SWC_ALL_HOUSE_DATA'] },
      tags: { domain: 'liveResult' },
    })
    throw congressResult.reason
  }

  return (
    <LocationCongressLiveResults
      house="house"
      initialCongressData={congressRaceLiveResult}
      locale={locale}
    />
  )
}
