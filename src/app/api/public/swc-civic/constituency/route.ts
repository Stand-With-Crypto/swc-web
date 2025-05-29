import { NextResponse } from 'next/server'

import { getLatLongFromAddress } from '@/utils/server/swcCivic/utils/getLatLongFromAddress'
import { querySWCCivicConstituencyFromLatLong } from '@/utils/server/swcCivic/queries/queryConstituencyFromLatLong'

export const GET = async (req: Request) => {
  const url = new URL(req.url)
  const address = url.searchParams.get('address')
  const placeId = url.searchParams.get('placeId')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  let latitude: number | null = null
  let longitude: number | null = null

  try {
    const { latitude: lat, longitude: lng } = await getLatLongFromAddress(address, placeId)

    latitude = lat
    longitude = lng
  } catch {
    return NextResponse.json({ error: 'Unable to get latitude and longitude' }, { status: 400 })
  }

  const constituency = await querySWCCivicConstituencyFromLatLong(latitude, longitude)

  if (!constituency) {
    return NextResponse.json({ error: 'Constituency not found' }, { status: 404 })
  }

  return NextResponse.json(constituency)
}
