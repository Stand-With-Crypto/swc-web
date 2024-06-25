import 'server-only'

import { NextResponse } from 'next/server'

import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'

export const dynamic = 'error'
export const revalidate = 0

export async function GET() {
  const data = await queryDTSIAllPeople()
  return NextResponse.json(data)
}
