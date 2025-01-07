import * as Sentry from '@sentry/nextjs'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import { DTSI_AllPeopleQuery, DTSI_AllPeopleQueryVariables } from '@/data/dtsi/generated'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const DTSI_AllPeopleQueryTag = 'DTSI_AllPeopleQuery'

const query = /* GraphQL */ `
  query AllPeople($limit: Int!) {
    people(
      limit: $limit
      offset: 0
      personRoleGroupingOr: [
        CURRENT_US_HOUSE_OF_REPS
        CURRENT_US_SENATE
        US_PRESIDENT
        RUNNING_FOR_US_HOUSE_OF_REPS
        RUNNING_FOR_US_SENATE
        RUNNING_FOR_PRESIDENT
        NEXT_PRESIDENT
        NEXT_US_HOUSE_OF_REPS
        NEXT_US_SENATE
      ]
    ) {
      ...PersonCard
    }
  }
  ${fragmentDTSIPersonCard}
`
/*
Because this request returns so many results, we should ensure we're only triggering this logic in cached endpoints/routes
*/
export const queryDTSIAllPeople = async ({ limit }: { limit: number } = { limit: 1500 }) => {
  if (limit > 1500) {
    throw new Error('We should not be requesting more than 1500 people at a time')
  }
  const results = await fetchDTSI<DTSI_AllPeopleQuery, DTSI_AllPeopleQueryVariables>(
    query,
    {
      limit,
    },
    {
      nextTags: [DTSI_AllPeopleQueryTag],
      nextRevalidate: SECONDS_DURATION['10_MINUTES'],
    },
  )
  if (results.people.length === 1500) {
    Sentry.captureMessage(
      'Previous limit set in queryDTSIAllPeople has been reached, we should consider re-evaluating our architecture',
      { extra: { resultsLength: results.people.length } },
    )
  }
  return results
}
