import { getAggregateDonations } from '@/data/donations/getAggregateDonations'
import { getMockAggregateDonations } from '@/data/donations/getMockAggregateDonations'
import { SupportedLocale } from '@/intl/locales'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import 'server-only'

export const dynamic = 'error'
export const revalidate = 1

const zodParams = z.object({
  locale: z.nativeEnum(SupportedLocale),
})

export async function GET(_request: NextRequest, { params }: { params: { locale: string } }) {
  const { locale } = zodParams.parse(params)
  return NextResponse.json(await getMockAggregateDonations())
}
