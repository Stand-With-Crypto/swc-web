import 'server-only'

import { NextResponse } from 'next/server'

import { getSumDonations } from '@/data/aggregations/getSumDonations'

export const dynamic = 'error'
export const revalidate = 1

export async function GET() {
  const data = await getSumDonations({ includeFairshake: true })
  return NextResponse.json(data)
}
