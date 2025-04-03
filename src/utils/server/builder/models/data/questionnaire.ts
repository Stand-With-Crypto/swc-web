import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { getLogger } from '@/utils/shared/logger'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  QUESTION_ANSWER_OPTIONS,
  SWCQuestionnaireAnswers,
  SWCQuestionnaireEntry,
  zodQuestionnaireSchemaValidation,
} from '@/utils/shared/zod/getSWCQuestionnaire'

const logger = getLogger(`builderIOQuestionnaire`)

export async function getQuestionnaire({
  dtsiSlug,
  countryCode,
}: {
  dtsiSlug: string
  countryCode: SupportedCountryCodes
}) {
  try {
    const entry = await pRetry(
      () =>
        builderSDKClient.get(BuilderDataModelIdentifiers.QUESTIONNAIRE, {
          query: {
            data: {
              dtsiSlug,
              countryCode: countryCode.toUpperCase(),
            },
          },
          fields: 'data',
        }),
      { retries: 3, minTimeout: 5000 },
    )

    const isValidResponse = zodQuestionnaireSchemaValidation.safeParse(entry?.data)

    // Using safeParse to prevent logging errors when a politician hasn't answered the questionnaire yet.
    if (!isValidResponse.success) return null

    return normalizeQuestionnaire(isValidResponse.data, countryCode)
  } catch (e) {
    logger.error('error getting questionnaire entry:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'builder.io', model: 'questionnaire' },
      extra: { dtsiSlug, countryCode },
    })
    return null
  }
}

export interface NormalizedQuestionnaire {
  dtsiSlug: string
  questions: Array<{
    question: string
    answer: QUESTION_ANSWER_OPTIONS
    otherAnswer?: string
  }>
}

function normalizeQuestionnaire(
  questionnaire: SWCQuestionnaireEntry,
  countryCode: SupportedCountryCodes,
): NormalizedQuestionnaire {
  const countryCodeToQuestionnaireMap: Record<SupportedCountryCodes, SWCQuestionnaireAnswers[]> = {
    [SupportedCountryCodes.US]: questionnaire.questionnaireUs,
    [SupportedCountryCodes.AU]: questionnaire.questionnaireAu,
    [SupportedCountryCodes.CA]: questionnaire.questionnaireCa,
    [SupportedCountryCodes.GB]: questionnaire.questionnaireGb,
  }

  return {
    dtsiSlug: questionnaire.dtsiSlug,
    questions: countryCodeToQuestionnaireMap[countryCode].map(
      ({ question, answer, otherAnswer }) => ({
        question,
        answer,
        otherAnswer: answer === QUESTION_ANSWER_OPTIONS.OTHER ? otherAnswer : undefined,
      }),
    ),
  }
}
