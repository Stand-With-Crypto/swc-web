import 'server-only'

import { NextResponse } from 'next/server'

import { getSumDonations } from '@/data/aggregations/getSumDonations'

export const revalidate = 30 // 30 seconds
export const dynamic = 'error'

interface RequestContext {
  params: Promise<{
    countryCode: string
  }>
}

export async function GET(_: Request, { params }: RequestContext) {
  const { countryCode } = await params
  const data = await getSumDonations({ countryCode })
  return NextResponse.json(data)
}
