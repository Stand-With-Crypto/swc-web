import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import {
  DTSI_StatePrimaryDistrictsQuery,
  DTSI_StatePrimaryDistrictsQueryVariables,
} from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { LocationStateCode } from '@/utils/shared/urls'

const query = /* GraphQL */ `
  query StatePrimaryDistricts($primaryCountryCode: String!, $primaryState: String!) {
    primaryDistricts(primaryCountryCode: $primaryCountryCode, primaryState: $primaryState)
  }
`

export const queryDTSIStatePrimaryDistricts = async ({
  stateCode,
  countryCode,
}: {
  stateCode: LocationStateCode
  countryCode: SupportedCountryCodes
}) => {
  const results = await fetchDTSI<
    DTSI_StatePrimaryDistrictsQuery,
    DTSI_StatePrimaryDistrictsQueryVariables
  >(query, {
    primaryCountryCode: countryCode,
    primaryState: stateCode,
  })

  return results
}
