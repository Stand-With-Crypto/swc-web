import 'server-only'

import { getSumDonations } from '@/data/aggregations/getSumDonations'
import { NextResponse } from 'next/server'

export const dynamic = 'error'
export const revalidate = 5

export async function GET() {
  const data = await getSumDonations({ includeFairshake: true })
  return NextResponse.json(data)
}
