import * as Sentry from '@sentry/nextjs'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import { DTSI_PeopleBySlugQuery, DTSI_PeopleBySlugQueryVariables } from '@/data/dtsi/generated'

const query = /* GraphQL */ `
  query PeopleBySlug($slugs: [String!]!) {
    people(limit: 100, offset: 0, slugIn: $slugs) {
      ...PersonCard
    }
  }
  ${fragmentDTSIPersonCard}
`
export type DTSIPersonForUserActions = DTSI_PeopleBySlugQuery['people'][0]

export const queryDTSIPeopleBySlugForUserActions = async (slugs: string[]) => {
  // TODO figure out why codegen generates a type that suggest a string not in an array is valid
  const data = await fetchDTSI<DTSI_PeopleBySlugQuery, DTSI_PeopleBySlugQueryVariables>(query, {
    slugs,
  })

  if (slugs.length !== data.people.length) {
    Sentry.withScope(scope => {
      scope.setExtras({
        expected: slugs,
        returned: data.people.map(x => x.slug),
        difference: slugs.length - data.people.length,
        missingSlugs: slugs.filter(slug => !data.people.some(person => person.slug === slug)),
      })
      scope.setTags({ domain: 'queryDTSIPeopleBySlugForUserActions' })

      Sentry.captureMessage(
        `queryDTSIPeopleBySlugForUserActions returned ${data.people.length} people for ${slugs.length} slugs`,
        'warning',
      )
    })

    return null
  }

  return data
}
