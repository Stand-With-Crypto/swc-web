import { getTotalDonations } from '@/data/donations/getTotalDonations'
import { SUPPORTED_LOCALES, SupportedLocale } from '@/intl/locales'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'error'
export const revalidate = 1

const zodParams = z.object({
  locale: z.nativeEnum(SupportedLocale),
})

export async function GET(_request: NextRequest, { params }: { params: { locale: string } }) {
  const { locale } = zodParams.parse(params)
  const data = await getTotalDonations({ locale })
  return NextResponse.json(data)
}
