import 'server-only'

import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

export async function getAllPetitionsFromAPI(
  countryCode: SupportedCountryCodes,
): Promise<SWCPetition[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetchReq(`${baseUrl}${apiUrls.petitions({ countryCode })}`)

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
