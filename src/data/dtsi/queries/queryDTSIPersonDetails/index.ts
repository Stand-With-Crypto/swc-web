import { dtsiPersonDetailsQueryString } from './dtsiPersonDetailsQueryString'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { DTSI_PersonDetailsQuery, DTSI_PersonDetailsQueryVariables } from '@/data/dtsi/generated'

export type DTSIPersonDetails = DTSI_PersonDetailsQuery['people'][0]

export const queryDTSIPersonDetails = async (slug: string) => {
  const results = await fetchDTSI<DTSI_PersonDetailsQuery, DTSI_PersonDetailsQueryVariables>(
    dtsiPersonDetailsQueryString,
    { slugIn: [slug] },
  )
  if (results.people.length !== 1) {
    throw new Error(`queryDTSIPersonDetails: expected 1 person, got ${results.people.length}`)
  }
  return results.people[0]
}
