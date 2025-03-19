import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { getLogger } from '@/utils/shared/logger'
import { zodQuestionnaireSchemaValidation } from '@/utils/shared/zod/getSWCQuestionnaire'

const logger = getLogger(`builderIOQuestionnaire`)
export async function getQuestionnaire(DTSISlug: string) {
  try {
    const entry = await pRetry(
      () =>
        builderSDKClient.get(BuilderDataModelIdentifiers.QUESTIONNAIRE, {
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
      tags: { domain: 'builder.io', model: 'questionnaire' },
      extra: { DTSISlug },
    })
    return null
  }
}
