import { Address } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { isInteger, isObject } from 'lodash-es'

import {
  getGoogleCivicDataFromAddress,
  GoogleCivicInfoResponse,
} from '@/utils/shared/googleCivicInfo'
import { logger } from '@/utils/shared/logger'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'

const SINGLE_MEMBER_STATES = ['AK', 'DE', 'ND', 'SD', 'VT', 'WY', 'DC']

const findCongressionalDistrictString = (response: GoogleCivicInfoResponse, address: string) => {
  if (Object.keys(response.divisions).every(key => key !== 'ocd-division/country:us')) {
    return { notFoundReason: 'NOT_USA_ADDRESS' as const }
  }
  const districtKeys = Object.keys(response.divisions)
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
  const districtNum =
    districtNumString.toLowerCase() === 'at-large' ? 1 : parseInt(districtNumString, 10)
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

export interface GetCongressionalDistrictFromAddressParams {
  stateCode?: USStateCode
}

/** @deprecated Use maybeGetElectoralZoneFromAddress instead */
export async function maybeGetCongressionalDistrictFromAddress(
  address?: Pick<Address, 'countryCode' | 'formattedDescription'> | null,
  params?: GetCongressionalDistrictFromAddressParams,
) {
  if (!address) {
    return { notFoundReason: 'USER_WITHOUT_ADDRESS' as const }
  }

  if (address.countryCode !== 'US') {
    return { notFoundReason: 'NOT_USA_ADDRESS' as const }
  }

  const usCongressionalDistrict = await getCongressionalDistrictFromAddress(
    address.formattedDescription,
    params,
  )

  return usCongressionalDistrict
}

/** @deprecated Use getElectoralZoneFromAddress instead */
export async function getCongressionalDistrictFromAddress(
  address?: string | null,
  params?: GetCongressionalDistrictFromAddressParams,
) {
  if (!address?.length) return { notFoundReason: 'USER_WITHOUT_ADDRESS' as const }
  const result = await getGoogleCivicDataFromAddress(address).catch(() => null)
  if (!result) {
    return { notFoundReason: 'CIVIC_API_DOWN' as const }
  }
  if ('error' in result) {
    if (result.error.code === 429) {
      return { notFoundReason: 'CIVIC_API_QUOTA_LIMIT_REACHED' as const }
    }
    if (result.error.code === 400) {
      return { notFoundReason: 'CIVIC_API_BAD_REQUEST' as const }
    }
    if (result.error.code === 401) {
      return { notFoundReason: 'CIVIC_API_UNAUTHORIZED' as const }
    }
    return { notFoundReason: 'NOT_USA_ADDRESS' as const }
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

  const { stateCode: passedStateCode } = params ?? {}

  if (passedStateCode && passedStateCode !== stateCode) {
    return { notFoundReason: 'NOT_SAME_STATE' as const }
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

export function formatGetCongressionalDistrictFromAddressNotFoundReason(
  data: Exclude<CongressionalDistrictFromAddress, { stateCode: string }> | undefined | null,
) {
  const defaultError = "We can't find your district right now, we're working on a fix."
  if (!data || !('notFoundReason' in data)) {
    return defaultError
  }

  switch (data.notFoundReason) {
    case 'USER_WITHOUT_ADDRESS':
      return 'Please fill out your address.'
    case 'NOT_USA_ADDRESS':
      return 'Please enter a US-based address.'
    case 'NOT_SAME_STATE':
      return 'Looks like your address is not in this state.'
    case 'NOT_SPECIFIC_ENOUGH':
      return 'Please enter a specific address that includes street-level information.'
    case 'CIVIC_API_DOWN':
      return "Looks like we're having some issues finding your representative right now. Please come back later and try again."
    case 'UNEXPECTED_ERROR':
    default:
      return defaultError
  }
}

export function logCongressionalDistrictNotFound({
  address,
  notFoundReason,
  domain,
}: {
  address: string
  notFoundReason: string
  domain: string
}) {
  logger.error(
    `No usCongressionalDistrict found for address ${address} with code ${notFoundReason}`,
  )
  if (['CIVIC_API_DOWN', 'UNEXPECTED_ERROR'].includes(notFoundReason)) {
    Sentry.captureMessage(`No usCongressionalDistrict found for address`, {
      extra: {
        domain,
        notFoundReason,
        address,
      },
    })
  }
}
