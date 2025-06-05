import { groupBy, isNumber, mapValues, mergeWith, sumBy } from 'lodash-es'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'
import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { ElectoralZone } from '@/utils/server/swcCivic/types'
import { getLatLongFromAddressOrPlaceId } from '@/utils/server/swcCivic/utils/getLatLongFromAddress'

const UNKNOWN = 'Unknown'

function getElectoralZoneFullName(stateCode: string, zoneName: string) {
  return `${stateCode}${zoneName}`
}

async function getAdvocatesCountByElectoralZone() {
  const usAddressesByElectoralZonePromise = prismaClient.address.groupBy({
    _count: {
      id: true,
    },
    by: ['usCongressionalDistrict', 'administrativeAreaLevel1'],
    where: {
      countryCode: { in: ['US', 'us'] },
      usCongressionalDistrict: {
        not: null,
      },
    },
  })

  const otherAddressesPromise = prismaClient.address.groupBy({
    _count: {
      id: true,
    },
    by: ['googlePlaceId', 'formattedDescription'],
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
  })

  const [usAddressesByElectoralZone, otherAddresses] = await Promise.all([
    usAddressesByElectoralZonePromise,
    otherAddressesPromise,
  ])

  const otherAddressesWithElectoralZone = await Promise.allSettled(
    otherAddresses.map(async address => {
      const location = await getLatLongFromAddressOrPlaceId({
        address: address.formattedDescription,
        placeId: address.googlePlaceId ?? undefined,
      })

      const electoralZone = await querySWCCivicElectoralZoneFromLatLong(
        location.latitude,
        location.longitude,
      )

      return { ...address, electoralZone }
    }),
  )

  const usElectoralZones = Object.fromEntries(
    usAddressesByElectoralZone.map(address => [
      getElectoralZoneFullName(address.administrativeAreaLevel1, address.usCongressionalDistrict!),
      address._count.id,
    ]),
  )

  const otherElectoralZones = otherAddressesWithElectoralZone
    .filter(address => address.status === 'fulfilled')
    .map(({ value: address }) => {
      const electoralZone = address.electoralZone || ({} as ElectoralZone)

      return {
        countryCode: electoralZone.countryCode || UNKNOWN,
        state: electoralZone.stateCode || UNKNOWN,
        zone: electoralZone?.zoneName || UNKNOWN,
        advocates: address._count.id,
      }
    })
  const otherElectoralZonesByCountry = groupBy(otherElectoralZones, 'countryCode')
  const otherElectoralZonesByCountryAndEZ = Object.fromEntries(
    Object.entries(otherElectoralZonesByCountry).map(([countryCode, electoralZones]) => {
      return [
        countryCode,
        mapValues(
          groupBy(electoralZones, electoralZone =>
            getElectoralZoneFullName(
              countryCode === 'us' ? electoralZone.state : '',
              electoralZone.zone,
            ),
          ),
          electoralZone => sumBy(electoralZone, 'advocates'),
        ),
      ]
    }),
  )

  const usResult = mergeWith(
    {},
    usElectoralZones,
    otherElectoralZonesByCountryAndEZ['us'],
    (a, b) => {
      if (isNumber(a) && isNumber(b)) {
        return a + b
      }
    },
  )

  const result = { ...otherElectoralZonesByCountryAndEZ, us: usResult }

  const sortedResult = Object.fromEntries(
    Object.entries(result).map(([countryCode, electoralZones]) => {
      return [
        countryCode,
        Object.fromEntries(Object.entries(electoralZones).sort(([, a], [, b]) => b - a)),
      ]
    }),
  )

  console.log(sortedResult)
}

void runBin(getAdvocatesCountByElectoralZone)
