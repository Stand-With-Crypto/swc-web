import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { withBuilderIoAuthMiddleware } from '@/utils/server/serverWrappers/withBuilderIoAuthMiddleware'
import { getLogger } from '@/utils/shared/logger'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

const logger = getLogger('builder-webhook-events-data-route')

const EVENTS_PATH = '/events'
const EVENTS_STATE_PATH = '/events/[state]'
const EVENTS_STATE_EVENT_SLUG_PATH = '/events/[state]/[eventSlug]'

export const POST = withBuilderIoAuthMiddleware(async () => {
  revalidatePath(EVENTS_PATH)
  revalidatePath(EVENTS_STATE_PATH)
  revalidatePath(EVENTS_STATE_EVENT_SLUG_PATH)
  ORDERED_SUPPORTED_COUNTRIES.forEach(countryCode =>
    revalidatePath(`/${countryCode}${EVENTS_PATH}`),
  )
  ORDERED_SUPPORTED_COUNTRIES.forEach(countryCode =>
    revalidatePath(`/${countryCode}${EVENTS_STATE_PATH}`),
  )
  ORDERED_SUPPORTED_COUNTRIES.forEach(countryCode =>
    revalidatePath(`/${countryCode}${EVENTS_STATE_EVENT_SLUG_PATH}`),
  )

  logger.info(
    `Revalidation completed for path: ${EVENTS_PATH}, ${EVENTS_STATE_PATH} and ${EVENTS_STATE_EVENT_SLUG_PATH}`,
  )

  return new NextResponse('Success', {
    status: 200,
  })
})
