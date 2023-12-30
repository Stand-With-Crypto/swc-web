import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { DTSI_PersonDetailsQuery, DTSI_PersonDetailsQueryVariables } from '@/data/dtsi/generated'
import { dtsiPersonDetailsQueryString } from './dtsiPersonDetailsQueryString'

/*
Because this request returns so many results, we should ensure we're only triggering this logic in cached endpoints/routes
*/
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

export type DTSIPersonDetails = DTSI_PersonDetailsQuery['people'][0]
