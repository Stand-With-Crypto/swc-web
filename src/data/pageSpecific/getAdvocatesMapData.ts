import 'server-only'

import { getTotalAdvocatesPerState } from '@/data/aggregations/getTotalAdvocatesPerState'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export async function getAdvocatesMapData({ countryCode }: { countryCode: SupportedCountryCodes }) {
  const [totalAdvocatesPerState] = await Promise.all([getTotalAdvocatesPerState(countryCode)])

  return {
    advocatesMapData: {
      totalAdvocatesPerState,
    },
  }
}

export type GetAdvocatesMapDataResponse = Awaited<ReturnType<typeof getAdvocatesMapData>>
