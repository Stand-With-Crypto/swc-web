import {
  GoogleCivicInfoResponse,
  getGoogleCivicDataFromAddress,
} from '@/utils/shared/googleCivicInfo'
import * as Sentry from '@sentry/nextjs'
import _ from 'lodash'

const findCongressionalDistrictString = (response: GoogleCivicInfoResponse, address: string) => {
  if (Object.keys(response.divisions).every(key => key !== 'ocd-division/country:us')) {
    return { notFoundReason: 'NOT_USA_ADDRESS' as const }
  }
  const district = Object.keys(response.divisions).filter(key => key.includes('/cd:'))
  if (!district.length) {
    Sentry.captureMessage('No districts returned for address', {
      tags: { domain: 'getCongressionalDistrictFromAddress' },
      extra: { response, address },
    })
    return { notFoundReason: 'NOT_SPECIFIC_ENOUGH' as const }
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
    return { notFoundReason: 'UNEXPECTED_ERROR' as const }
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
    return { notFoundReason: 'UNEXPECTED_ERROR' as const }
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
