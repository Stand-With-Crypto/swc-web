import * as Sentry from '@sentry/nextjs'

import { convertToOnlyEnglishCharacters } from '@/utils/shared/convertToOnlyEnglishCharacters'
import { fetchReq } from '@/utils/shared/fetchReq'
import { logger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { fullUrl } from '@/utils/shared/urls'

/*
Sample response
{
  "normalizedInput": {
    "line1": "2031 North 25th Street",
    "city": "Philadelphia",
    "state": "PA",
    "zip": "19121"
  },
  "kind": "civicinfo#representativeInfoResponse",
  "divisions": {
    "ocd-division/country:us/state:pa": {
      "name": "Pennsylvania",
      "officeIndices": [
        2
      ]
    },
    "ocd-division/country:us": {
      "name": "United States",
      "officeIndices": [
        0,
        1
      ]
    },
    "ocd-division/country:us/state:pa/cd:3": {
      "name": "Pennsylvania's 3rd congressional district",
      "officeIndices": [
        3
      ]
    }
  },
  "offices": [
    {
      "name": "President of the United States",
      "divisionId": "ocd-division/country:us",
      "levels": [
        "country"
      ],
      "roles": [
        "headOfGovernment",
        "headOfState"
      ],
      "officialIndices": [
        0
      ]
    },
  ],
  "officials": [
    {
      "name": "Joseph R. Biden",
      "address": [
        {
          "line1": "1600 Pennsylvania Avenue Northwest",
          "city": "Washington",
          "state": "DC",
          "zip": "20500"
        }
      ],
      "party": "Democratic Party",
      "phones": [
        "(202) 456-1111"
      ],
      "urls": [
        "https://www.whitehouse.gov/",
        "https://en.wikipedia.org/wiki/Joe_Biden"
      ],
      "channels": [
        {
          "type": "Twitter",
          "id": "potus"
        }
      ]
    }
  ]
}
*/
interface GoogleCivicInfoAddress {
  line1: string
  city: string
  state: string
  zip: string
}

export interface GoogleCivicInfoOfficial {
  name: string
  address: GoogleCivicInfoAddress[]
  party: string
  phones: string[]
  urls: string[]
  photoUrl: string
  channels: {
    type: string
    id: string
  }[]
}

export interface GoogleCivicInfoResponse {
  normalizedInput: GoogleCivicInfoAddress
  kind: 'civicinfo#representativeInfoResponse'
  divisions: Record<string, { name: string }>
  officials: GoogleCivicInfoOfficial[]
}

interface GoogleCivicErrorResponse {
  error: {
    code: 404 | 429 | 400 | 401
    errors: object[]
    message: string
  }
}

const civicDataByAddressCache = new Map<
  string,
  GoogleCivicInfoResponse | GoogleCivicErrorResponse
>()

const NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY,
  'NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY',
)
const CIVIC_BY_ADDRESS_ENDPOINT = 'https://www.googleapis.com/civicinfo/v2/representatives'
export function getGoogleCivicDataFromAddress(address: string) {
  const apiUrl = new URL(CIVIC_BY_ADDRESS_ENDPOINT)
  apiUrl.searchParams.set('key', NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY)
  apiUrl.searchParams.set('address', address.trim())
  apiUrl.searchParams.set('levels', 'country')
  apiUrl.searchParams.set('includeOffices', 'true')

  const cached = civicDataByAddressCache.get(apiUrl.toString())
  if (cached) {
    return Promise.resolve(cached)
  }

  return fetchReq(
    apiUrl.toString(),
    {
      referrer: fullUrl('/'),
    },
    {
      isValidRequest: (response: Response) =>
        (response.status >= 200 && response.status < 300) ||
        response.status === 404 ||
        response.status === 429,
    },
  )
    .then(res => res.json())
    .then(res => {
      const response = res as GoogleCivicInfoResponse | GoogleCivicErrorResponse
      if ('error' in response && response.error.code === 429) {
        return response
      }
      civicDataByAddressCache.set(apiUrl.toString(), response)
      return response
    })
}

export function getGoogleCivicOfficialByDTSIName(
  dtsiPersonName: { firstName: string; lastName: string; firstNickname: string },
  googleCivicInfoResponse: GoogleCivicInfoResponse,
) {
  const normalizeName = (name: string) => {
    return convertToOnlyEnglishCharacters(name.toLowerCase().trim()).replace(/[.-\s]/g, '')
  }
  const normalizedDTSIFirstNickname = normalizeName(dtsiPersonName.firstNickname)
  const normalizedDTSIFirstName = normalizeName(dtsiPersonName.firstName)
  const normalizedDTSILastName = normalizeName(dtsiPersonName.lastName)
  const { officials } = googleCivicInfoResponse

  // This is necessary since the Google Civic API return the middle initial (e.g. "John F. Kennedy")
  // While the DTSI data does not (e.g. "John Kennedy")
  let matchOfficial = officials.find(official => {
    const normalizedOfficialName = normalizeName(official.name)
    return (
      (normalizedOfficialName.startsWith(normalizedDTSIFirstName) ||
        normalizedOfficialName.startsWith(normalizedDTSIFirstNickname)) &&
      normalizedOfficialName.includes(normalizedDTSILastName)
    )
  })

  if (!matchOfficial) {
    matchOfficial = officials.find(official => {
      const normalizedOfficialName = normalizeName(official.name)
      return normalizedOfficialName.includes(normalizedDTSILastName)
    })
  }

  if (!matchOfficial) {
    const extra = {
      dtsiPersonName,
      normalizedDTSIFirstName,
      normalizedDTSILastName,
      officials,
    }
    logger.info('returned people', extra)
    const vacantResult = officials.find(official => official.name.toLocaleLowerCase() === 'vacant')
    if (!vacantResult) {
      Sentry.captureMessage('getGoogleCivicOfficialByDTSIName - Official not found', {
        extra,
      })
    }
    return null
  }

  return matchOfficial
}
