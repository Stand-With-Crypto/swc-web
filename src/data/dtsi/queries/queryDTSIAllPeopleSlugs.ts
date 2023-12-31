import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { DTSI_AllPeopleSlugsQuery, DTSI_AllPeopleSlugsQueryVariables } from '@/data/dtsi/generated'
import * as Sentry from '@sentry/nextjs'

export const query = /* GraphQL */ `
  query AllPeopleSlugs {
    people(limit: 1500, offset: 0) {
      slug
    }
  }
`
/*
Because this request returns so many results, we should ensure we're only triggering this logic in cached endpoints/routes
*/
export const queryDTSIAllPeopleSlugs = async () => {
  const results = await fetchDTSI<DTSI_AllPeopleSlugsQuery, DTSI_AllPeopleSlugsQueryVariables>(
    query,
  )
  if (results.people.length === 1500) {
    Sentry.captureMessage(
      'Previous limit set in queryDTSIAllPeopleSlugs has been reached, we should consider re-evaluating our architecture',
      { extra: { resultsLength: results.people.length } },
    )
  }
  return results
}
