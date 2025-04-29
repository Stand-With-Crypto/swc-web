import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import {
  DTSI_PeopleByUsCongressionalDistrictQuery,
  DTSI_PeopleByUsCongressionalDistrictQueryVariables,
} from '@/data/dtsi/generated'
import { orderDTSICongressionalDistrictResults } from '@/utils/shared/orderSenatorsByImportanceForOutreach'

const query = /* GraphQL */ `
  query PeopleByUSCongressionalDistrict($congressionalDistrict: Int!, $stateCode: String!) {
    peopleByUSCongressionalDistrict(
      congressionalDistrict: $congressionalDistrict
      stateCode: $stateCode
    ) {
      ...PersonCard
    }
    stateReps: people(
      limit: 999
      offset: 0
      personRolePrimaryState: $stateCode
      personRoleGroupingOr: [CURRENT_US_STATE_ATTORNEY_GENERAL, CURRENT_US_STATE_GOVERNOR]
    ) {
      ...PersonCard
    }
  }
  ${fragmentDTSIPersonCard}
`

export const queryDTSIPeopleByCongressionalDistrict = async ({
  stateCode,
  districtNumber,
}: {
  stateCode: string
  districtNumber: number
}) => {
  const data = await fetchDTSI<
    DTSI_PeopleByUsCongressionalDistrictQuery,
    DTSI_PeopleByUsCongressionalDistrictQueryVariables
  >(query, {
    stateCode,
    congressionalDistrict: districtNumber,
  })
  const people = [
    ...orderDTSICongressionalDistrictResults(data.peopleByUSCongressionalDistrict),
    ...orderDTSICongressionalDistrictResults(data.stateReps),
  ]

  return orderDTSICongressionalDistrictResults(people)
}

export type DTSIPeopleByCongressionalDistrictQueryResult = NonNullable<
  Awaited<ReturnType<typeof queryDTSIPeopleByCongressionalDistrict>>
>
