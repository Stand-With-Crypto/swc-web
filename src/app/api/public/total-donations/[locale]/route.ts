import 'server-only'

import { getSumDonations } from '@/data/aggregations/getSumDonations'
import { NextResponse } from 'next/server'

export const dynamic = 'error'
export const revalidate = 1

export async function GET() {
  const data = await getSumDonations()
  return NextResponse.json(data)
}
