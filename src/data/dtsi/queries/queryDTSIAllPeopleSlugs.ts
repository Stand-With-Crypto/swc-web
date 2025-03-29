import * as Sentry from '@sentry/nextjs'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { DTSI_AllPeopleSlugsQuery, DTSI_AllPeopleSlugsQueryVariables } from '@/data/dtsi/generated'
import { PERSON_ROLE_GROUPINGS_FOR_ALL_PEOPLE_QUERY } from '@/data/dtsi/queries/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const query = /* GraphQL */ `
  query AllPeopleSlugs($personRoleGroupingOr: [PersonGrouping!]) {
    people(limit: 1500, offset: 0, personRoleGroupingOr: $personRoleGroupingOr) {
      slug
    }
  }
`
/*
Because this request returns so many results, we should ensure we're only triggering this logic in cached endpoints/routes
*/
export const queryDTSIAllPeopleSlugs = async ({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}) => {
  const results = await fetchDTSI<DTSI_AllPeopleSlugsQuery, DTSI_AllPeopleSlugsQueryVariables>(
    query,
    {
      personRoleGroupingOr: PERSON_ROLE_GROUPINGS_FOR_ALL_PEOPLE_QUERY[countryCode],
    },
  )
  if (results.people.length === 1500) {
    Sentry.captureMessage(
      'Previous limit set in queryDTSIAllPeopleSlugs has been reached, we should consider re-evaluating our architecture',
      { extra: { resultsLength: results.people.length } },
    )
  }
  return results
}
