import { groupBy, isNumber, mapValues, mergeWith, sumBy } from 'lodash-es'

import { runBin } from '@/bin/runBin'
import { writeFile } from '@/bin/swcCivic/advocatesCountByElectoralZone/file'
import { FileName } from '@/bin/swcCivic/advocatesCountByElectoralZone/types'
import {
  BASE_NAME,
  getElectoralZoneFromAddress,
  getElectoralZoneFullName,
  retrieveDataWithPagination,
} from '@/bin/swcCivic/advocatesCountByElectoralZone/utils'
import { prismaClient } from '@/utils/server/prismaClient'
import { ElectoralZone } from '@/utils/server/swcCivic/types'

const UNKNOWN = 'Unknown'

const OUTPUT_FILE_NAME: FileName = `${BASE_NAME}.csv`

async function getUsAddressesByElectoralZone() {
  return retrieveDataWithPagination('getUsAddressesByElectoralZone', pagination =>
    prismaClient.address.groupBy({
      _count: {
        id: true,
      },
      by: ['usCongressionalDistrict', 'administrativeAreaLevel1'],
      orderBy: [
        {
          usCongressionalDistrict: 'asc',
        },
        {
          administrativeAreaLevel1: 'asc',
        },
      ],
      where: {
        countryCode: { in: ['US', 'us'] },
        usCongressionalDistrict: {
          not: null,
        },
      },
      ...pagination,
    }),
  )
}

async function getOtherAddressesByElectoralZone() {
  return retrieveDataWithPagination('getOtherAddressesByElectoralZone', pagination =>
    prismaClient.address.groupBy({
      _count: {
        id: true,
      },
      by: ['googlePlaceId', 'formattedDescription', 'id'],
      orderBy: [{ id: 'asc' }],
      where: {
        OR: [
          {
            countryCode: { in: ['US', 'us'] },
            usCongressionalDistrict: null,
          },
          {
            countryCode: {
              notIn: ['US', 'us'],
            },
          },
        ],
      },
      ...pagination,
    }),
  )
}

async function getAdvocatesCountByElectoralZone() {
  const [usAddressesByElectoralZone, otherAddresses] = await Promise.all([
    getUsAddressesByElectoralZone(),
    getOtherAddressesByElectoralZone(),
  ])

  const otherAddressesWithElectoralZone = []

  let index = 0

  for await (const address of otherAddresses) {
    const electoralZone = await getElectoralZoneFromAddress(address, index)
    otherAddressesWithElectoralZone.push(electoralZone)
    index++
  }

  const usElectoralZones = Object.fromEntries(
    usAddressesByElectoralZone.map(address => [
      getElectoralZoneFullName(
        'us',
        address.administrativeAreaLevel1,
        address.usCongressionalDistrict!,
      ),
      address._count.id,
    ]),
  )

  const otherElectoralZones = otherAddressesWithElectoralZone.map(address => {
    const electoralZone = address.electoralZone || ({} as ElectoralZone)
    const { countryCode, stateCode, zoneName } = electoralZone

    return {
      countryCode: countryCode ? countryCode.toLowerCase() : UNKNOWN,
      state: stateCode || UNKNOWN,
      zone: zoneName || UNKNOWN,
      advocates: address._count.id,
    }
  })
  const otherElectoralZonesByCountry = groupBy(otherElectoralZones, 'countryCode')
  const otherElectoralZonesByCountryAndElectoralZone = Object.fromEntries(
    Object.entries(otherElectoralZonesByCountry).map(([countryCode, electoralZones]) => {
      return [
        countryCode,
        mapValues(
          groupBy(electoralZones, electoralZone =>
            getElectoralZoneFullName(countryCode, electoralZone.state, electoralZone.zone),
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

  const sortedResult = Object.entries(result).map(([countryCode, electoralZones]) => {
    return [
      countryCode,
      Object.entries(electoralZones).sort(([, a], [, b]) => b - a) as [string, number][],
    ] as const
  })

  const fileContent = sortedResult
    .map(([countryCode, electoralZones]) =>
      electoralZones
        .map(([electoralZone, count]) => `${countryCode};${electoralZone};${count}`)
        .join('\n'),
    )
    .join('\n')

  writeFile(OUTPUT_FILE_NAME, fileContent)
}

void runBin(getAdvocatesCountByElectoralZone)
