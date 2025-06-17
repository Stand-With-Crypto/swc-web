import { groupBy, isNumber, mapValues, mergeWith, sumBy } from 'lodash-es'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'
import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { ElectoralZone } from '@/utils/server/swcCivic/types'
import { getLatLongFromAddressOrPlaceId } from '@/utils/server/swcCivic/utils/getLatLongFromAddress'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const UNKNOWN = 'UNMATCHED'

const ITEMS_PER_PAGE = Number(process.env.DATABASE_QUERY_LIMIT) || 100_000

const LOCAL_CACHE_PATH = join(__dirname, '../localCache')

interface Address {
  advocates: number
  countryCode: string
  formattedDescription: string
  googlePlaceId: string | null
  id: string
}

export function getStateCode(countryCode: string, stateCodeOrName: string) {
  if (countryCode === 'us') {
    if (stateCodeOrName.toUpperCase() in US_STATE_CODE_TO_DISPLAY_NAME_MAP) {
      return stateCodeOrName
    }

    const state = Object.entries(US_STATE_CODE_TO_DISPLAY_NAME_MAP).find(
      ([_, stateName]) => stateName === stateCodeOrName,
    )

    return state ? state[0] : UNKNOWN
  }

  return stateCodeOrName
}

export function getElectoralZoneFullName(countryCode: string, zoneName: string, stateCode: string) {
  if (countryCode === SupportedCountryCodes.US) {
    return stateCode === UNKNOWN || zoneName === UNKNOWN
      ? UNKNOWN
      : `${stateCode}${zoneName === 'At-Large' ? 0 : zoneName}`
  }

  return zoneName
}

export async function retrieveDataWithPagination<T>(
  key: string,
  fetchData: (pagination: { limit: number; offset: number }) => Promise<T[]>,
) {
  let pageIndex = 0
  let hasMoreData = true

  const data: T[] = []

  while (hasMoreData) {
    console.info(`${key}: Fetching page ${pageIndex + 1}...`)

    const page = await fetchData({ limit: ITEMS_PER_PAGE, offset: pageIndex * ITEMS_PER_PAGE })

    data.push(...page)

    console.info(`${key}: Page ${pageIndex + 1} fetched. Total results count: ${data.length}.`)

    if (page.length < ITEMS_PER_PAGE) {
      hasMoreData = false
    }

    pageIndex++
  }

  return data
}

export async function getElectoralZoneFromAddress(
  address: Address,
): Promise<Address & { electoralZone: ElectoralZone | undefined }> {
  try {
    if (!address.googlePlaceId && !address.formattedDescription) {
      return { ...address, electoralZone: undefined }
    }

    const location = await getLatLongFromAddressOrPlaceId({
      address: address.formattedDescription,
      placeId: address.googlePlaceId || undefined,
    })

    const electoralZone = await querySWCCivicElectoralZoneFromLatLong(
      location.latitude,
      location.longitude,
    )

    return { ...address, electoralZone }
  } catch (error) {
    console.error(error)

    return { ...address, electoralZone: undefined }
  }
}

async function getUsAddressesByElectoralZone() {
  return retrieveDataWithPagination(
    'getUsAddressesByElectoralZone',
    pagination =>
      prismaClient.$queryRaw<
        {
          advocates: bigint
          usCongressionalDistrict: string | null
          administrativeAreaLevel1: string
          id: string
        }[]
      >`
        SELECT count(address.id) AS advocates,
              address.us_congressional_district AS usCongressionalDistrict,
              address.administrative_area_level_1 AS administrativeAreaLevel1,
              address.id
        FROM address
        JOIN user ON user.address_id = address.id
        WHERE address.country_code = 'us' AND
              address.us_congressional_district IS NOT NULL
        GROUP BY address.us_congressional_district,
                address.administrative_area_level_1,
                address.id
        ORDER BY address.id
        LIMIT ${pagination.limit}
        OFFSET ${pagination.offset};`,
  )
}

async function getOtherAddressesByElectoralZone() {
  return retrieveDataWithPagination(
    'getOtherAddressesByElectoralZone',
    pagination =>
      prismaClient.$queryRaw<
        {
          advocates: bigint
          countryCode: string
          formattedDescription: string
          googlePlaceId: string | null
          id: string
        }[]
      >`
        SELECT count(address.id) AS advocates,
              address.country_code AS countryCode,
              address.formatted_description AS formattedDescription,
              address.google_place_id AS googlePlaceId,
              address.id
        FROM address
        JOIN user ON user.address_id = address.id
        WHERE address.country_code IN ('au', 'ca', 'gb') OR
              (address.country_code = 'us' AND address.us_congressional_district IS NULL)
        GROUP BY address.google_place_id,
                address.formatted_description,
                address.country_code,
                address.id
        ORDER BY address.id
        LIMIT ${pagination.limit}
        OFFSET ${pagination.offset};`,
  )
}

async function getAdvocatesCountByElectoralZone() {
  const [usAddressesByElectoralZone, otherAddresses] = await Promise.all([
    getUsAddressesByElectoralZone(),
    getOtherAddressesByElectoralZone(),
  ])

  const otherAddressesWithElectoralZone = []

  for await (const address of otherAddresses) {
    const electoralZone = await getElectoralZoneFromAddress({
      ...address,
      advocates: Number(address.advocates),
    })
    otherAddressesWithElectoralZone.push(electoralZone)
  }

  const usElectoralZones = Object.fromEntries(
    usAddressesByElectoralZone
      .map(address => {
        const stateCode = getStateCode('us', address.administrativeAreaLevel1) || UNKNOWN

        return [
          getElectoralZoneFullName('us', address.usCongressionalDistrict!, stateCode),
          Number(address.advocates),
        ] as const
      })
      .reduce<[string, number][]>(
        (usElectoralZones, [usElectoralZoneKey, usElectoralZoneAdvocates]) => {
          if (usElectoralZones.some(([key]) => key === usElectoralZoneKey)) {
            return usElectoralZones.map(([key, value]) => {
              if (key === usElectoralZoneKey) {
                return [key, value + usElectoralZoneAdvocates]
              }

              return [key, value]
            })
          }

          return [...usElectoralZones, [usElectoralZoneKey, usElectoralZoneAdvocates] as const]
        },
        [],
      ),
  )

  const otherElectoralZones = otherAddressesWithElectoralZone.map(address => {
    const electoralZone = address.electoralZone || ({} as ElectoralZone)
    const { stateCode, zoneName } = electoralZone

    return {
      countryCode: address.countryCode.toLowerCase(),
      state: stateCode ? getStateCode(address.countryCode, stateCode) : UNKNOWN,
      zone: zoneName || UNKNOWN,
      advocates: address.advocates,
    }
  })
  const otherElectoralZonesByCountry = groupBy(otherElectoralZones, 'countryCode')
  const otherElectoralZonesByCountryAndElectoralZone = Object.fromEntries(
    Object.entries(otherElectoralZonesByCountry).map(([countryCode, electoralZones]) => {
      return [
        countryCode,
        mapValues(
          groupBy(electoralZones, electoralZone =>
            getElectoralZoneFullName(countryCode, electoralZone.zone, electoralZone.state),
          ),
          electoralZone => sumBy(electoralZone, 'advocates'),
        ),
      ]
    }),
  )

  const usResult = mergeWith(
    {},
    usElectoralZones,
    otherElectoralZonesByCountryAndElectoralZone['us'],
    (a, b) => {
      if (isNumber(a) && isNumber(b)) {
        return a + b
      }
    },
  )

  const result = {
    ...otherElectoralZonesByCountryAndElectoralZone,
    us: usResult,
  }

  const electoralZonesByCountry = Object.entries(result)
    .filter(([countryCode]) => {
      return Object.values(SupportedCountryCodes).includes(countryCode)
    })
    .map(([countryCode, electoralZones]) => {
      return [
        countryCode,
        Object.entries(electoralZones).sort(([, a], [, b]) => b - a) as [string, number][],
      ] as const
    })

  const header = ['Country', 'Electoral Zone', 'Advocates'].join(';')

  electoralZonesByCountry.forEach(([countryCode, electoralZones]) => {
    const content = electoralZones
      .map(([electoralZone, count]) => `${countryCode};${electoralZone};${count}`)
      .join('\n')

    const total = electoralZones.reduce((sum, [_, count]) => sum + count, 0)

    const footer = [countryCode, 'TOTAL', total].join(';')

    writeFileSync(
      join(LOCAL_CACHE_PATH, `getAdvocatesCountByElectoralZone-${countryCode}.csv`),
      `${header}\n${content}\n${footer}`,
      {
        encoding: 'utf8',
        flag: 'w',
      },
    )
  })
}

void runBin(getAdvocatesCountByElectoralZone)
