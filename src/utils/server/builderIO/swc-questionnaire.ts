import * as Sentry from '@sentry/nextjs'
import { boolean, object, string } from 'zod'

import { builderIOClient } from '@/utils/server/builderIO/client'
import { getLogger } from '@/utils/shared/logger'

const zodQuestionnaireSchemaValidation = object({
  data: object({
    dtsiSlug: string(),
    q1ExperienceUsingBlockchainTechnology: boolean().optional(),
    q2BlockchainWillPlayMajorRoleNextInnoWave: boolean().optional(),
    q3AmerCryptoIsDrivingEconomicGrowth: boolean().optional(),
    q4UsCompAtRiskIfDigitalAssetsPushedOverse: boolean().optional(),
    q5UsModernizeRegulatoryEnvironmentForCrypto: boolean().optional(),
    q6WouldYouVoteInFavorOfLegislation: boolean().optional(),
    q7VoteInFavorOfLegisToPaymentStablecoins: boolean().optional(),
    q8ShareAnyOtherOpinionsOnCrypto: string().optional(),
  }),
  published: string().regex(/^published$/),
})

export type SWCQuestionnaireAnswers = Zod.infer<typeof zodQuestionnaireSchemaValidation>

const logger = getLogger(`contentfulQuestionnaire`)
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
