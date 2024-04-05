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
  }
  ${fragmentDTSIPersonCard}
`
export type DTSIPersonForUserActions =
  DTSI_PeopleByUsCongressionalDistrictQuery['peopleByUSCongressionalDistrict'][0]

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
  return orderDTSICongressionalDistrictResults(data.peopleByUSCongressionalDistrict)
}

export type DTSIPeopleByCongressionalDistrictQueryResult = NonNullable<
  Awaited<ReturnType<typeof queryDTSIPeopleByCongressionalDistrict>>
>
