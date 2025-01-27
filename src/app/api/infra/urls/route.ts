import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

import { getVanityUrls } from '@/utils/server/vanityUrl'

export const revalidate = 3600 // 1 hour
export const dynamic = 'force-static'

export async function GET() {
  const vanityUrls = await getVanityUrls()

  if (!vanityUrls) {
    Sentry.captureException('No vanity URLs found in getVanityUrls', {
      tags: {
        domain: 'vanityUrls',
      },
      extra: {
        vanityUrls,
      },
    })

    return NextResponse.json([])
  }

  return NextResponse.json(vanityUrls)
}
