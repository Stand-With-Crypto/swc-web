import * as Sentry from '@sentry/nextjs'

import { builderIOClient } from '@/utils/server/builderIO/client'
import { zodQuestionnaireSchemaValidation } from '@/utils/shared/getSWCQuestionnaire'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger(`builderIOQuestionnaire`)
export async function getQuestionnaire(DTSISlug: string) {
  try {
    const entry = await builderIOClient.get('questionnaire', {
      query: {
        data: {
          dtsiSlug: DTSISlug,
        },
      },
    })

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
