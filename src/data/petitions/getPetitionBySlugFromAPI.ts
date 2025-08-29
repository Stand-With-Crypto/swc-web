import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

export async function getPetitionBySlugFromAPI(
  countryCode: SupportedCountryCodes,
  slug: string,
): Promise<SWCPetition | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetchReq(
      `${baseUrl}${apiUrls.petitionBySlug({ countryCode, petitionSlug: slug })}`,
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
