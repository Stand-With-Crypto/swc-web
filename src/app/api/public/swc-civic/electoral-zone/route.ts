import { NextResponse } from 'next/server'

import { querySWCCivicElectoralZoneFromLatLong } from '@/utils/server/swcCivic/queries/queryElectoralZoneFromLatLong'
import { getLatLongFromAddress } from '@/utils/server/swcCivic/utils/getLatLongFromAddress'

export const GET = async (req: Request) => {
  const url = new URL(req.url)
  const address = url.searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  let latitude: number | null = null
  let longitude: number | null = null

  try {
    const { latitude: lat, longitude: lng } = await getLatLongFromAddress(address)

    latitude = lat
    longitude = lng
  } catch {
    return NextResponse.json({ error: 'Unable to get latitude and longitude' }, { status: 400 })
  }

  const electoralZone = await querySWCCivicElectoralZoneFromLatLong(latitude, longitude)

  if (!electoralZone) {
    return NextResponse.json({ error: 'Electoral zone not found' }, { status: 404 })
  }

  return NextResponse.json(electoralZone)
}
