import 'server-only'

import { getTotalAdvocatesPerStateByCountry } from '@/data/aggregations/getTotalAdvocatesPerStateByCountry'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export async function getAdvocatesMapData({ countryCode }: { countryCode: SupportedCountryCodes }) {
  const results = await getTotalAdvocatesPerStateByCountry(countryCode)

  return {
    advocatesMapData: {
      totalAdvocatesPerState: results,
    },
  }
}
export type GetAdvocatesMapDataResponse = Awaited<ReturnType<typeof getAdvocatesMapData>>
