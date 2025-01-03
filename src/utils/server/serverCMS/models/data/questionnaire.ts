import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { serverCMS } from '@/utils/server/serverCMS/serverCMS'
import { zodQuestionnaireSchemaValidation } from '@/utils/shared/getSWCQuestionnaire'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger(`builderIOQuestionnaire`)
export async function getQuestionnaire(DTSISlug: string) {
  try {
    const entry = await pRetry(
      () =>
        serverCMS.get('questionnaire', {
          query: {
            data: {
              dtsiSlug: DTSISlug,
            },
          },
        }),
      { retries: 3, minTimeout: 5000 },
    )

    const isValidResponse = zodQuestionnaireSchemaValidation.safeParse(entry)

    // Using safeParse to prevent logging errors when a politician hasn't answered the questionnaire yet.
    if (!isValidResponse.success) return null

    return entry
  } catch (e) {
    logger.error('error getting questionnaire entry:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'getQuestionnaire' },
      extra: { DTSISlug },
    })
    return null
  }
}
