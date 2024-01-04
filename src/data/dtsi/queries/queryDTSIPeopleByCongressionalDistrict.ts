import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_PeopleByUsCongressionalDistrictQuery,
  DTSI_PeopleByUsCongressionalDistrictQueryVariables,
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
  // TODO figure out why codegen generates a type that suggest a string not in an array is valid
  const data = await fetchDTSI<
    DTSI_PeopleByUsCongressionalDistrictQuery,
    DTSI_PeopleByUsCongressionalDistrictQueryVariables
  >(query, {
    stateCode: config.stateCode,
    congressionalDistrict: config.districtNumber,
  })
  return data.peopleByUSCongressionalDistrict
}
