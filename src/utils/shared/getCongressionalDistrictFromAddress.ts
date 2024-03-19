import * as Sentry from '@sentry/nextjs'
import { isInteger, isObject } from 'lodash-es'

import {
  getGoogleCivicDataFromAddress,
  GoogleCivicInfoResponse,
} from '@/utils/shared/googleCivicInfo'

const SINGLE_MEMBER_STATES = ['AK', 'DE', 'ND', 'SD', 'VT', 'WY']

const findCongressionalDistrictString = (response: GoogleCivicInfoResponse, address: string) => {
  if (Object.keys(response.divisions).every(key => key !== 'ocd-division/country:us')) {
    return { notFoundReason: 'NOT_USA_ADDRESS' as const }
  }
  const districtKeys = Object.keys(response.divisions)
  if (districtKeys.find(key => key.includes('ocd-division/country:us/district:dc'))) {
    return { notFoundReason: 'NO_REPS_IN_STATE' as const }
  }
  const district = districtKeys.filter(key => key.includes('/cd:'))
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
  if (cdStr !== 'cd' || !isInteger(districtNum)) {
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

export interface GetCongressionalDistrictFromAddressSuccess {
  stateCode: string
  districtNumber: number
  googleCivicData: GoogleCivicInfoResponse
}

export type CongressionalDistrictFromAddress = Awaited<
  ReturnType<typeof getCongressionalDistrictFromAddress>
>

export async function getCongressionalDistrictFromAddress(address: string) {
  const result = await getGoogleCivicDataFromAddress(address).catch(() => null)
  if (!result) {
    return { notFoundReason: 'CIVIC_API_DOWN' as const }
  }
  if ('error' in result) {
    const returned = { notFoundReason: 'NOT_USA_ADDRESS' as const }
    return returned
  }

  // Explicit check if the address is in a state with no congressional districts since Civic API
  // does not return a cd division for these states
  let stateCode:
    | string
    | {
        notFoundReason: 'UNEXPECTED_ERROR'
      } = result.normalizedInput.state
  if (SINGLE_MEMBER_STATES.includes(stateCode)) {
    return {
      stateCode,
      districtNumber: 1,
      googleCivicData: result,
    } as GetCongressionalDistrictFromAddressSuccess
  }

  const districtString = findCongressionalDistrictString(result, address)
  if (isObject(districtString)) {
    return districtString
  }
  const districtNumber = parseCongressionalDistrictString(districtString)
  if (isObject(districtNumber)) {
    return districtNumber
  }
  stateCode = parseStateString(districtString)
  if (isObject(stateCode)) {
    return stateCode
  }
  return {
    stateCode,
    districtNumber,
    googleCivicData: result,
  } as GetCongressionalDistrictFromAddressSuccess
}
