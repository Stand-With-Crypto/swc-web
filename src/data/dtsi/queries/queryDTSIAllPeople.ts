import * as Sentry from '@sentry/nextjs'
import { uniqBy } from 'lodash-es'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import { DTSI_AllPeopleQuery, DTSI_AllPeopleQueryVariables } from '@/data/dtsi/generated'
import { PERSON_ROLE_GROUPINGS_FOR_ALL_PEOPLE_QUERY } from '@/data/dtsi/queries/constants'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export const DTSI_AllPeopleQueryTag = 'DTSI_AllPeopleQuery'

const PEOPLE_OUTSIDE_FILTERS_TO_INCLUDE: Record<SupportedCountryCodes, string[]> = {
  [SupportedCountryCodes.US]: ['wiley---nickel'],
  [SupportedCountryCodes.CA]: [],
  [SupportedCountryCodes.GB]: [],
  [SupportedCountryCodes.AU]: [],
}

const query = /* GraphQL */ `
  query AllPeople(
    $limit: Int!
    $personRoleGroupingOr: [PersonGrouping!]
    $peopleOutsideFilters: [String!]
  ) {
    people(limit: $limit, offset: 0, personRoleGroupingOr: $personRoleGroupingOr) {
      ...PersonCard
    }
    additionalPeople: people(limit: $limit, offset: 0, slugIn: $peopleOutsideFilters) {
      ...PersonCard
    }
  }
  ${fragmentDTSIPersonCard}
`
/*
Because this request returns so many results, we should ensure we're only triggering this logic in cached endpoints/routes
*/
export const queryDTSIAllPeople = async ({
  limit = 1500,
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
}: {
  limit?: number
  countryCode?: SupportedCountryCodes
} = {}) => {
  if (limit > 1500) {
    throw new Error('We should not be requesting more than 1500 people at a time')
  }
  const results = await fetchDTSI<DTSI_AllPeopleQuery, DTSI_AllPeopleQueryVariables>(
    query,
    {
      limit,
      personRoleGroupingOr: PERSON_ROLE_GROUPINGS_FOR_ALL_PEOPLE_QUERY[countryCode],
      peopleOutsideFilters: PEOPLE_OUTSIDE_FILTERS_TO_INCLUDE[countryCode],
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
  return mergeAllPeopleResults(results)
}

function mergeAllPeopleResults(
  results: DTSI_AllPeopleQuery,
): Omit<DTSI_AllPeopleQuery, 'additionalPeople'> {
  const mergedList = [...results.people, ...results.additionalPeople]
  return {
    people: uniqBy(mergedList, 'slug'),
  }
}
