import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { withBuilderIoAuthMiddleware } from '@/utils/server/serverWrappers/withBuilderIoAuthMiddleware'
import { getLogger } from '@/utils/shared/logger'
import { ORDERED_SUPPORTED_LOCALES } from '@/utils/shared/supportedLocales'

const logger = getLogger('builder-webhook-partners-data-route')

const PARTNERS_PATH = '/partners'

export const POST = withBuilderIoAuthMiddleware(async () => {
  revalidatePath(PARTNERS_PATH)
  ORDERED_SUPPORTED_LOCALES.forEach(locale => revalidatePath(`/${locale}${PARTNERS_PATH}`))

  logger.info(`Revalidation completed for path: ${PARTNERS_PATH}`)

  return new NextResponse('Success', {
    status: 200,
  })
})
