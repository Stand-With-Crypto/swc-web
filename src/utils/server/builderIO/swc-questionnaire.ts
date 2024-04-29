import * as Sentry from '@sentry/nextjs'
import { nativeEnum, object, string } from 'zod'

import { builderIOClient } from '@/utils/server/builderIO/client'
import { getLogger } from '@/utils/shared/logger'

export enum QUESTION_ANSWER_OPTIONS {
  'Yes' = 'Yes',
  'No' = 'No',
  'Not answered' = 'Not answered',
}

const zodQuestionnaireSchemaValidation = object({
  data: object({
    dtsiSlug: string(),
    q1ExperienceUsingBlockchainTechnology: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q2BlockchainWillPlayMajorRoleNextInnoWave: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q3AmerCryptoIsDrivingEconomicGrowth: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q4UsCompAtRiskIfDigitalAssetsPushedOverse: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q5UsModernizeRegulatoryEnvironmentForCrypto: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q6WouldYouVoteInFavorOfLegislation: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q7VoteInFavorOfLegisToPaymentStablecoins: nativeEnum(QUESTION_ANSWER_OPTIONS),
    q8ShareAnyOtherOpinionsOnCrypto: string().optional(),
  }),
  published: string().regex(/^published$/),
})

export type SWCQuestionnaireAnswers = Zod.infer<typeof zodQuestionnaireSchemaValidation>

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
