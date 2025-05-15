import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import {
  DTSI_DistrictsByCountryCodeQuery,
  DTSI_DistrictsByCountryCodeQueryVariables,
} from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const query = /* GraphQL */ `
  query DistrictsByCountryCode($primaryCountryCode: String!) {
    primaryDistricts(primaryCountryCode: $primaryCountryCode)
  }
`

export const queryDTSIDistrictsByCountryCode = async ({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}) => {
  const results = await fetchDTSI<
    DTSI_DistrictsByCountryCodeQuery,
    DTSI_DistrictsByCountryCodeQueryVariables
  >(query, {
    primaryCountryCode: countryCode,
  })

  return results
}
