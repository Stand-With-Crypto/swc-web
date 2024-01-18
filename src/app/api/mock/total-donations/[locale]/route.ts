import { getMockSumDonations } from '@/data/aggregations/getMockSumDonations'
import { NextResponse } from 'next/server'
import 'server-only'

export const dynamic = 'error'
export const revalidate = 1

export async function GET() {
  return NextResponse.json(await getMockSumDonations())
}
