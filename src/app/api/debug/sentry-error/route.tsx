import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// A faulty API route to test Sentry's error monitoring
export function GET() {
  const baz = {} as any
  return NextResponse.json({ name: baz.foo.bar.doesNotExist })
}
