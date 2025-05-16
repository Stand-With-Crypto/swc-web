import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import {
  DTSI_StatePrimaryDistrictsQuery,
  DTSI_StatePrimaryDistrictsQueryVariables,
} from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { LocationStateCode } from '@/utils/shared/urls'

const query = /* GraphQL */ `
  query StatePrimaryDistricts(
    $primaryCountryCode: String!
    $primaryState: String!
    $primaryDistrict: String
  ) {
    primaryDistricts(
      primaryCountryCode: $primaryCountryCode
      primaryState: $primaryState
      primaryDistrict: $primaryDistrict
    )
  }
`

export const queryDTSIStatePrimaryDistricts = async ({
  stateCode,
  countryCode,
  district,
}: {
  stateCode: LocationStateCode
  countryCode: SupportedCountryCodes
  district?: string
}) => {
  const results = await fetchDTSI<
    DTSI_StatePrimaryDistrictsQuery,
    DTSI_StatePrimaryDistrictsQueryVariables
  >(query, {
    primaryCountryCode: countryCode,
    primaryState: stateCode,
    primaryDistrict: district,
  })

  return results
}
