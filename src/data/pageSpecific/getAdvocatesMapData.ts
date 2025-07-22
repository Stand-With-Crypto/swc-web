import 'server-only'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getTotalAdvocatesPerStateByCountry } from '@/data/aggregations/getTotalAdvocatesPerStateByCountry'

export async function getAdvocatesMapData({ countryCode }: { countryCode: SupportedCountryCodes }) {
  const results = await getTotalAdvocatesPerStateByCountry(countryCode)

  return {
    advocatesMapData: {
      totalAdvocatesPerState: results,
    },
  }
}
export type GetAdvocatesMapDataResponse = Awaited<ReturnType<typeof getAdvocatesMapData>>
