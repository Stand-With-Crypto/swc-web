import { readFile, writeFile } from '@/bin/swcCivic/advocatesCountByElectoralZone/file'
import {
  Address,
  CacheContent,
  ErrorsContent,
  FileName,
} from '@/bin/swcCivic/advocatesCountByElectoralZone/types'
import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { getLatLongFromAddressOrPlaceId } from '@/utils/server/swcCivic/utils/getLatLongFromAddress'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'

const ITEMS_PER_PAGE = Number(process.env.DATABASE_QUERY_LIMIT) || 100_000

export const BASE_NAME = 'getAdvocatesCountByElectoralZone'

const CACHE_FILE_NAME: FileName = `${BASE_NAME}.cache.json`
const ERRORS_FILE_NAME: FileName = `${BASE_NAME}.errors.json`

export const cache = JSON.parse(readFile(CACHE_FILE_NAME) || '[]') as CacheContent
export const errors = JSON.parse(readFile(ERRORS_FILE_NAME) || '{}') as ErrorsContent

export function getElectoralZoneFullName(
  countryCode: string,
  stateCodeOrName: string,
  zoneName: string,
) {
  if (countryCode === 'us') {
    if (stateCodeOrName.toUpperCase() in US_STATE_CODE_TO_DISPLAY_NAME_MAP) {
      return `${stateCodeOrName}${zoneName}`
    }

    const state = Object.entries(US_STATE_CODE_TO_DISPLAY_NAME_MAP).find(
      ([_, stateName]) => stateName === stateCodeOrName,
    )

    return state ? `${state[0]}${zoneName}` : `${stateCodeOrName}${zoneName}`
  }

  return zoneName
}

export async function retrieveDataWithPagination<T>(
  key: string,
  fetchData: (pagination: { skip: number; take: number }) => Promise<T[]>,
) {
  let pageIndex = 0
  let hasMoreData = true

  const data: T[] = []

  while (hasMoreData) {
    console.info(`${key}: Fetching page ${pageIndex + 1}...`)

    const page = await fetchData({ skip: pageIndex * ITEMS_PER_PAGE, take: ITEMS_PER_PAGE })

    data.push(...page)

    console.info(`${key}: Page ${pageIndex + 1} fetched. Total results count: ${data.length}.`)

    if (page.length < ITEMS_PER_PAGE) {
      hasMoreData = false
    }

    pageIndex++
  }

  return data
}

export async function getElectoralZoneFromAddress(address: Address, index: number) {
  function logEvent(
    type: 'error' | 'loaded from api' | 'loaded from cache' | 'skipped',
    id: number,
  ) {
    console.info(`getElectoralZoneFromAddress: ${id} (${type})`)
  }

  try {
    if (!address.googlePlaceId && !address.formattedDescription) {
      logEvent('skipped', index)
      return { ...address, electoralZone: undefined }
    }

    const cachedResult = cache.find(row => {
      if (address.googlePlaceId) {
        return address.googlePlaceId === row.placeId
      }

      return address.formattedDescription === row.description
    })

    if (cachedResult) {
      logEvent('loaded from cache', index)
      return { ...address, electoralZone: cachedResult.electoralZone }
    }

    const location = await getLatLongFromAddressOrPlaceId({
      address: address.formattedDescription,
      placeId: address.googlePlaceId ?? undefined,
    })

    const electoralZone = await querySWCCivicElectoralZoneFromLatLong(
      location.latitude,
      location.longitude,
    )

    logEvent('loaded from api', index)

    cache.push({
      placeId: address.googlePlaceId,
      description: address.formattedDescription,
      electoralZone,
    })

    writeFile(CACHE_FILE_NAME, JSON.stringify(cache))

    return { ...address, electoralZone }
  } catch (error) {
    logEvent('error', index)

    errors[address.id] = error instanceof Error ? error.message : 'Unknown error'

    writeFile(ERRORS_FILE_NAME, JSON.stringify(errors))

    return { ...address, electoralZone: undefined }
  }
}
