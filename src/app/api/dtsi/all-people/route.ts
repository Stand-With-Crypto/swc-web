import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { NextResponse } from 'next/server'
import 'server-only'

export const dynamic = 'error'
export const revalidate = 60 * 24

export async function GET() {
  const data = await queryDTSIAllPeople()
  return NextResponse.json(data)
}
