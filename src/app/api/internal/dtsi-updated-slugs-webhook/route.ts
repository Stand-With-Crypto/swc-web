import { ORDERED_SUPPORTED_LOCALES, SupportedLocale } from '@/intl/locales'
import { getLogger } from '@/utils/shared/logger'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { getIntlUrls } from '@/utils/shared/urls'
import _ from 'lodash'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const logger = getLogger('/api/internal/dtsi-updated-slugs-webhook')

const zodPayload = z.object({
  type: z.literal('people-with-updates'),
  personSlugs: z.array(z.string()),
})

const DTSI_WEBHOOK_SECRET = requiredOutsideLocalEnv(
  process.env.DTSI_WEBHOOK_SECRET,
  'DTSI_WEBHOOK_SECRET',
)

// TODO debounce this endpoint with inngest

export async function POST(request: NextRequest) {
  if (!request.headers.get('authorization')) {
    return NextResponse.json(
      { error: 'Must include authorization header with webhook secret' },
      { status: 401 },
    )
  }
  if (request.headers.get('authorization') !== DTSI_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Must include the right authorization header with webhook secret' },
      { status: 401 },
    )
  }
  const validatedFields = zodPayload.parse(await request.json())
  logger.info('Received webhook with updated slugs', validatedFields)
  const pathsToUpdate = _.flatten(
    ORDERED_SUPPORTED_LOCALES.map(locale => {
      const urls = getIntlUrls(locale, { actualPaths: true })
      return [
        urls.home(),
        urls.politiciansHomepage(),
        ...validatedFields.personSlugs.map(slug => urls.politicianDetails(slug)),
      ]
    }),
  )
  pathsToUpdate.forEach(page => revalidatePath(page))
  logger.info('updated pages', pathsToUpdate)
  return NextResponse.json({ pathsToUpdate })
}
