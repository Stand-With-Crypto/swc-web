import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_PeopleByUsCongressionalDistrictQuery,
  DTSI_PeopleByUsCongressionalDistrictQueryVariables,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import * as Sentry from '@sentry/nextjs'

const query = /* GraphQL */ `
  query PeopleByUSCongressionalDistrict($congressionalDistrict: Int!, $stateCode: String!) {
    peopleByUSCongressionalDistrict(
      congressionalDistrict: $congressionalDistrict
      stateCode: $stateCode
    ) {
      ...PersonCard
    }
  }
  ${fragmentDTSIPersonCard}
`
export type DTSIPersonForUserActions =
  DTSI_PeopleByUsCongressionalDistrictQuery['peopleByUSCongressionalDistrict'][0]

export const queryDTSIPeopleByCongressionalDistrict = async (config: {
  stateCode: string
  districtNumber: number
}) => {
  const data = await fetchDTSI<
    DTSI_PeopleByUsCongressionalDistrictQuery,
    DTSI_PeopleByUsCongressionalDistrictQueryVariables
  >(query, {
    stateCode: config.stateCode,
    congressionalDistrict: config.districtNumber,
  })
  // TODO now that we can support multiple reps being returned, we should build the UX for it
  const person = data.peopleByUSCongressionalDistrict.find(
    x => x.primaryRole?.roleCategory === DTSI_PersonRoleCategory.CONGRESS,
  )
  return person || null
}
