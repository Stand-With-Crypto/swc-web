import 'server-only'

import { NextResponse } from 'next/server'

import { getSumDonations } from '@/data/aggregations/getSumDonations'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

export async function GET() {
  const data = await getSumDonations()
  return NextResponse.json(data)
}
