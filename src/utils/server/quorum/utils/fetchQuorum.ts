import { normalizeQuorumString } from '@/utils/server/quorum/utils/quorumNormalizers'
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

const logger = getLogger('fetchQuorum')

export interface NormalizedQuorumPolitician {
  id: string
  firstName: string
  lastName: string
  middleName: string
  email: string | null
  phone: string | null
  imageUrl: string
  nameAndTitle: string
  regionRepresented?: string
  stateRepresented?: string
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
  region_represented?: string
  most_recent_role_state?: string
}

interface QuorumNewPersonResponse {
  objects: QuorumPolitician[]
}

export async function fetchQuorumByAdvancedSearch({
  countryCode,
  query,
  limit = 100,
}: {
  countryCode: SupportedCountryCodes
  query: string
  limit?: number
}): Promise<NormalizedQuorumPolitician[] | undefined> {
  if (!QUORUM_API_KEY || !QUORUM_API_USERNAME) {
    logger.info('Missing QUORUM_API_KEY and QUORUM_API_USERNAME')
    return
  }

  const url = new URL(`${QUORUM_BASE_API_URL}/newperson`)

  url.searchParams.set('api_key', QUORUM_API_KEY)
  url.searchParams.set('username', QUORUM_API_USERNAME)
  url.searchParams.set('limit', limit.toString())

  url.searchParams.set('most_recent_person_type__in', QUORUM_MOST_RECENT_PERSON_TYPE_IN)

  url.searchParams.set('advanced_search', normalizeQuorumString(query))

  url.searchParams.set('most_recent_region', COUNTRY_CODE_TO_QUORUM_MOST_RECENT_REGION[countryCode])

  const response = await fetchReq(url.toString(), undefined, {
    withScope: scope => {
      scope.setTags({
        domain: 'quorum',
        countryCode,
        function: 'fetchQuorumByPersonName',
      })
      scope.setExtras({
        ...Object.fromEntries(url.searchParams.entries()),
      })
    },
  })

  const data = (await response.json()) as QuorumNewPersonResponse

  if (!data?.objects || data.objects.length === 0) {
    return
  }

  return data.objects.map(normalizeQuorumPolitician)
}

export async function fetchQuorumByPersonId(personId: string) {
  if (!QUORUM_API_KEY || !QUORUM_API_USERNAME) {
    logger.info('Missing QUORUM_API_KEY and QUORUM_API_USERNAME')
    return
  }

  const url = new URL(`${QUORUM_BASE_API_URL}/newperson/${personId}`)

  url.searchParams.set('api_key', QUORUM_API_KEY)
  url.searchParams.set('username', QUORUM_API_USERNAME)

  const response = await fetchReq(url.toString(), undefined, {
    withScope: scope => {
      scope.setTags({
        domain: 'quorum',
        function: 'fetchQuorumByPersonId',
      })
      scope.setExtras({
        ...Object.fromEntries(url.searchParams.entries()),
      })
    },
  })

  const data = (await response.json()) as QuorumPolitician

  if (!data) {
    return
  }

  return normalizeQuorumPolitician(data)
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
    nameAndTitle: politician.name,
    regionRepresented: politician.region_represented,
    stateRepresented: politician.most_recent_role_state,
  }
}
