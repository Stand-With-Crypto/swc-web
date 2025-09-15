import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls, INTERNAL_BASE_URL } from '@/utils/shared/urls'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

export async function getPetitionBySlugFromAPI(
  countryCode: SupportedCountryCodes,
  slug: string,
): Promise<SWCPetition | null> {
  try {
    const response = await fetchReq(
      `${INTERNAL_BASE_URL}${apiUrls.petitionBySlug({ countryCode, petitionSlug: slug })}`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch petitions: ${response.status}`)
    }

    const data = (await response.json()) as { data: SWCPetition }

    return data.data
  } catch (error) {
    console.error('Error fetching petition by slug from API:', error)
    return null
  }
}
