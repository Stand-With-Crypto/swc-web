import 'server-only'

import { NextResponse } from 'next/server'

import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'

export const revalidate = 0
export const dynamic = 'error'

export async function GET() {
  const data = await queryDTSIAllPeople()
  return NextResponse.json(data)
}
