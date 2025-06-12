import { convertToOnlyEnglishCharacters } from '@/utils/shared/convertToOnlyEnglishCharacters'
import { fetchReq } from '@/utils/shared/fetchReq'
import { getLogger } from '@/utils/shared/logger'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const QUORUM_API_KEY = requiredOutsideLocalEnv(
  process.env.QUORUM_API_KEY,
  'QUORUM_API_KEY',
  'Fetch politicians info from quorum API',
)
const QUORUM_API_USERNAME = requiredOutsideLocalEnv(
  process.env.QUORUM_API_USERNAME,
  'QUORUM_API_USERNAME',
  'Fetch politicians info from quorum API',
)

const QUORUM_BASE_API_URL = 'https://www.quorum.us/api'

const COUNTRY_CODE_TO_QUORUM_MOST_RECENT_REGION: Record<SupportedCountryCodes, string> = {
  [SupportedCountryCodes.US]: '1',
  [SupportedCountryCodes.CA]: '201',
  [SupportedCountryCodes.GB]: '204',
  [SupportedCountryCodes.AU]: '200',
}

// filters for legislators/parliamentarians
const QUORUM_MOST_RECENT_PERSON_TYPE_IN = '1,3,7'

const logger = getLogger('getQuorumPoliticianByElectoralZone')

export interface NormalizedQuorumPolitician {
  id: string
  firstName: string
  lastName: string
  middleName: string
  email: string
  phone: string
  imageUrl: string
  // remove this later
  title: string
}

interface QuorumPolitician {
  id: string
  firstname: string
  lastname: string
  middlename: string
  email: string
  most_recent_role_phone: string
  image_url: string
  name: string
}

interface QuorumNewPersonResponse {
  objects: QuorumPolitician[]
}

export async function fetchQuorumByPersonName({
  countryCode,
  personName,
  limit = 20,
}: {
  countryCode: SupportedCountryCodes
  personName: string
  limit?: number
}): Promise<NormalizedQuorumPolitician[] | undefined> {
  if (!QUORUM_API_KEY || !QUORUM_API_USERNAME) {
    logger.info('No QUORUM_API_KEY or QUORUM_API_USERNAME')
    return
  }

  const url = new URL(`${QUORUM_BASE_API_URL}/newperson`)

  url.searchParams.set('api_key', QUORUM_API_KEY)
  url.searchParams.set('username', QUORUM_API_USERNAME)
  // shows only current officials.
  // url.searchParams.set('ph_current', 'true')
  url.searchParams.set('limit', limit.toString())

  if (countryCode === SupportedCountryCodes.US) {
    url.searchParams.set('ph_major_role_type', '54,55,63,60,56,11,12,65,64,66,18,19,29,61')
  }

  url.searchParams.set('most_recent_person_type__in', QUORUM_MOST_RECENT_PERSON_TYPE_IN)

  url.searchParams.set('advanced_search', convertToOnlyEnglishCharacters(personName.toLowerCase()))

  url.searchParams.set('most_recent_region', COUNTRY_CODE_TO_QUORUM_MOST_RECENT_REGION[countryCode])

  console.log(`Fetching ${url.toString()}`)

  const response = await fetchReq(url.toString())

  const data = (await response.json()) as QuorumNewPersonResponse

  if (data.objects.length === 0) {
    return
  }

  return data?.objects.map(normalizeQuorumPolitician)
}

export async function fetchQuorumByPersonId(personId: string) {
  if (!QUORUM_API_KEY || !QUORUM_API_USERNAME) {
    logger.info('No QUORUM_API_KEY or QUORUM_API_USERNAME')
    return
  }

  const url = new URL(`${QUORUM_BASE_API_URL}/newperson/${personId}`)

  url.searchParams.set('api_key', QUORUM_API_KEY)
  url.searchParams.set('username', QUORUM_API_USERNAME)

  console.log(`Fetching ${url.toString()}`)

  const response = await fetchReq(url.toString())

  const data = (await response.json()) as QuorumPolitician

  if (!data) {
    return
  }

  return normalizeQuorumPolitician(data)
}

export async function fetchQuorumByRegionRepresented({
  countryCode,
  regionRepresented,
  limit = 20,
}: {
  countryCode: SupportedCountryCodes
  regionRepresented: string
  limit?: number
}) {
  if (!QUORUM_API_KEY || !QUORUM_API_USERNAME) {
    logger.info('No QUORUM_API_KEY or QUORUM_API_USERNAME')
    return
  }

  const url = new URL(`${QUORUM_BASE_API_URL}/newperson`)

  url.searchParams.set('api_key', QUORUM_API_KEY)
  url.searchParams.set('username', QUORUM_API_USERNAME)
  // shows only current officials.
  // url.searchParams.set('ph_current', 'false')
  url.searchParams.set('limit', limit.toString())

  if (countryCode === SupportedCountryCodes.US) {
    url.searchParams.set('ph_major_role_type', '54,55,63,60,56,11,12,65,64,66,18,19,29,61')
  }

  if (countryCode === SupportedCountryCodes.US) {
    url.searchParams.set('quick_search', regionRepresented)
  } else {
    url.searchParams.set('region_represented', regionRepresented)
  }

  url.searchParams.set('most_recent_person_type__in', QUORUM_MOST_RECENT_PERSON_TYPE_IN)

  url.searchParams.set('most_recent_region', COUNTRY_CODE_TO_QUORUM_MOST_RECENT_REGION[countryCode])

  console.log(`Fetching ${url.toString()}`)

  const response = await fetchReq(url.toString())

  const data = (await response.json()) as QuorumNewPersonResponse

  if (data.objects.length === 0) {
    return
  }

  return data?.objects.map(normalizeQuorumPolitician)
}

function normalizeQuorumPolitician(politician: QuorumPolitician): NormalizedQuorumPolitician {
  return {
    email: politician.email,
    firstName: politician.firstname,
    lastName: politician.lastname,
    middleName: politician.middlename,
    phone: politician.most_recent_role_phone,
    id: politician.id,
    imageUrl: politician.image_url,
    title: politician.name,
  }
}
