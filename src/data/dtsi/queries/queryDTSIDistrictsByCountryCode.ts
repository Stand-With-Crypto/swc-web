import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import {
  DTSI_DistrictsByCountryCodeQuery,
  DTSI_DistrictsByCountryCodeQueryVariables,
} from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const query = /* GraphQL */ `
  query DistrictsByCountryCode($primaryCountryCode: String!, $primaryState: String) {
    primaryDistricts(primaryCountryCode: $primaryCountryCode, primaryState: $primaryState)
  }
`

export const queryDTSIDistrictsByCountryCode = async ({
  countryCode,
  stateCode,
}: {
  countryCode: SupportedCountryCodes
  stateCode?: string
}) => {
  const results = await fetchDTSI<
    DTSI_DistrictsByCountryCodeQuery,
    DTSI_DistrictsByCountryCodeQueryVariables
  >(query, {
    primaryCountryCode: countryCode,
    primaryState: stateCode,
  })

  return results
}
