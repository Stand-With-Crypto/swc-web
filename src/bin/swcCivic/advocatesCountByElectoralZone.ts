import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'
import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { getLatLongFromAddressOrPlaceId } from '@/utils/server/swcCivic/utils/getLatLongFromAddress'

async function getAdvocatesCountByElectoralZone() {
  const usAddressesByElectoralZonePromise = prismaClient.address.groupBy({
    _count: {
      id: true,
    },
    by: ['usCongressionalDistrict', 'administrativeAreaLevel1'],
    where: {
      countryCode: 'US',
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
          countryCode: 'US',
          usCongressionalDistrict: null,
        },
        {
          countryCode: {
            not: 'US',
          },
        },
      ],
    },
  })

  const [usAddressesByElectoralZone, otherAddresses] = await Promise.all([
    usAddressesByElectoralZonePromise,
    otherAddressesPromise,
  ])

  const otherAddressesByElectoralZone = await Promise.all(
    otherAddresses.map(async address => {
      if (!address.googlePlaceId) {
        return { ...address, electoralZone: undefined }
      }

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

  const usElectoralZones = usAddressesByElectoralZone
    .map(address => ({
      zone: `${address.administrativeAreaLevel1}${address.usCongressionalDistrict!}`,
      advocates: address._count.id,
    }))
    .sort((a, b) => b.advocates - a.advocates)

  const otherElectoralZones = otherAddressesByElectoralZone.map(address => ({
    countryCode: address.electoralZone?.countryCode || 'Unknown',
    zone: address.electoralZone?.zoneName || 'Unknown',
    advocates: address._count.id,
  }))
  const otherElectoralZonesByCountry = Object.groupBy(otherElectoralZones, item => item.countryCode)

  console.log({ usElectoralZones, otherElectoralZonesByCountry })
}

void runBin(getAdvocatesCountByElectoralZone)
