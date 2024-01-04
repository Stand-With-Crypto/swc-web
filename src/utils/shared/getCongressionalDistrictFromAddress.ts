import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import * as Sentry from '@sentry/nextjs'
import _ from 'lodash'
/*
Sample response
{
  "normalizedInput": {
      "line1": "710 West 9th Road",
      "city": "Far Rockaway",
      "state": "NY",
      "zip": "10025"
  },
  "kind": "civicinfo#representativeInfoResponse",
  "divisions": {
      "ocd-division/country:us": {
          "name": "United States"
      },
      "ocd-division/country:us/state:ny": {
          "name": "New York"
      },
      "ocd-division/country:us/state:ny/cd:5": {
          "name": "New York's 5th congressional district"
      }
  }
*/
interface GoogleCivicDataResponse {
  normalizedInput: unknown // not used
  kind: 'civicinfo#representativeInfoResponse'
  divisions: Record<string, { name: string }>
}

const NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY,
  'NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY',
)
const CIVIC_BY_ADDRESS_ENDPOINT = 'https://www.googleapis.com/civicinfo/v2/representatives'
function getGoogleCivicDataFromAddress(address: string) {
  const url = `${CIVIC_BY_ADDRESS_ENDPOINT}?address=${encodeURIComponent(
    address.trim(),
  )}&key=${NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY}&levels=country&includeOffices=false`
  return fetchReq(url, { headers: { referer: 'localhost:3000' } })
    .then(res => res.json())
    .then(res => res as GoogleCivicDataResponse)
}

enum NotFoundReason {
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  NOT_USA_ADDRESS = 'NOT_USA_ADDRESS',
}

const findCongressionalDistrictString = (response: GoogleCivicDataResponse, address: string) => {
  if (Object.keys(response.divisions).every(key => key !== 'ocd-division/country:us')) {
    return { notFoundReason: NotFoundReason.NOT_USA_ADDRESS }
  }
  const district = Object.keys(response.divisions).filter(key => key.includes('/cd:'))
  if (!district.length) {
    Sentry.captureMessage('No districts returned for address', {
      tags: { domain: 'getCongressionalDistrictFromAddress' },
      extra: { response, address },
    })
    return { notFoundReason: NotFoundReason.UNEXPECTED_ERROR }
  }
  if (district.length > 1) {
    Sentry.captureMessage('more than one district returned for address', {
      tags: { domain: 'getCongressionalDistrictFromAddress' },
      extra: { response, address },
    })
  }
  return district[0]
}

const parseCongressionalDistrictString = (districtString: string) => {
  // ocd-division/country:us/state:ny/cd:5
  const slashParts = districtString.split('/')
  const [cdStr, districtNumString] = slashParts[slashParts.length - 1].split(':')
  const districtNum = parseInt(districtNumString, 10)
  if (cdStr !== 'cd' || !_.isInteger(districtNum)) {
    Sentry.captureMessage('unexpected district string structure', {
      tags: { domain: 'getCongressionalDistrictFromAddress' },
      extra: { districtString, cdStr, districtNumString },
    })
    return { notFoundReason: NotFoundReason.UNEXPECTED_ERROR }
  }
  return districtNum
}

const parseStateString = (districtString: string) => {
  // ocd-division/country:us/state:ny/cd:5
  const slashParts = districtString.split('/')
  const [stateStr, stateCode] = slashParts[slashParts.length - 2].split(':')
  if (stateStr !== 'state' || stateCode.length !== 2) {
    Sentry.captureMessage('unexpected district string structure', {
      tags: { domain: 'getCongressionalDistrictFromAddress' },
      extra: { stateStr, stateCode },
    })
    return { notFoundReason: NotFoundReason.UNEXPECTED_ERROR }
  }
  return stateCode.toUpperCase()
}

export async function getCongressionalDistrictFromAddress(address: string) {
  const result = await getGoogleCivicDataFromAddress(address)
  const districtString = findCongressionalDistrictString(result, address)
  if (_.isObject(districtString)) {
    return districtString
  }
  const districtNumber = parseCongressionalDistrictString(districtString)
  if (_.isObject(districtNumber)) {
    return districtNumber
  }
  const stateCode = parseStateString(districtString)
  if (_.isObject(stateCode)) {
    return stateCode
  }
  return { stateCode, districtNumber }
}
