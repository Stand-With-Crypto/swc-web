import 'server-only'

import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls, INTERNAL_BASE_URL } from '@/utils/shared/urls'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

export async function getAllPetitionsFromAPI(
  countryCode: SupportedCountryCodes,
): Promise<SWCPetition[]> {
  try {
    const response = await fetchReq(`${INTERNAL_BASE_URL}${apiUrls.petitions({ countryCode })}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch petitions: ${response.status}`)
    }

    const data = (await response.json()) as { data: SWCPetition[] }

    return data.data
  } catch (error) {
    console.error('Error fetching petitions from API:', error)
    return []
  }
}
