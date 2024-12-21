import * as Sentry from '@sentry/nextjs'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { DTSI_AllPeopleSlugsQuery, DTSI_AllPeopleSlugsQueryVariables } from '@/data/dtsi/generated'

const query = /* GraphQL */ `
  query AllPeopleSlugs {
    people(
      limit: 1500
      offset: 0
      personRoleGroupingOr: [
        CURRENT_US_HOUSE_OF_REPS
        CURRENT_US_SENATE
        US_PRESIDENT
        RUNNING_FOR_PRESIDENT
        RUNNING_FOR_US_HOUSE_OF_REPS
        RUNNING_FOR_US_SENATE
        NEXT_PRESIDENT
        NEXT_US_HOUSE_OF_REPS
        NEXT_US_SENATE
      ]
    ) {
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
