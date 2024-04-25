import * as Sentry from '@sentry/nextjs'
import { EntryFieldTypes } from 'contentful'
import { array, boolean, number, object, string } from 'zod'

import { contentfulClient } from '@/utils/server/contentful/client'
import { getLogger } from '@/utils/shared/logger'

const zodQuestionnaireSchemaValidation = object({
  total: number().gte(1),
  items: array(
    object({
      fields: object({
        slug: string(),
        q1ExperienceUsingBlockchainTechnology: boolean().optional(),
        q2BlockchainWillPlayMajorRoleNextInnoWave: boolean().optional(),
        q3AmerCryptoIsDrivingEconomicGrowth: boolean().optional(),
        q4UsCompAtRiskIfDigitalAssetsPushedOverse: boolean().optional(),
        q5UsModernizeRegulatoryEnvironmentForCrypto: boolean().optional(),
        q6WouldYouVoteInFavorOfLegislation: boolean().optional(),
        q7VoteInFavorOfLegisToPaymentStablecoins: boolean().optional(),
        q8ShareAnyOtherOpinionsOnCrypto: string().optional(),
      }),
    }),
  ).nonempty(),
})

export type QuestionnaireEntrySkeleton = {
  contentTypeId: 'swcQuestionnaire'
  fields: {
    slug: EntryFieldTypes.Text
    q1ExperienceUsingBlockchainTechnology: EntryFieldTypes.Boolean
    q2BlockchainWillPlayMajorRoleNextInnoWave: EntryFieldTypes.Boolean
    q3AmerCryptoIsDrivingEconomicGrowth: EntryFieldTypes.Boolean
    q4UsCompAtRiskIfDigitalAssetsPushedOverse: EntryFieldTypes.Boolean
    q5UsModernizeRegulatoryEnvironmentForCrypto: EntryFieldTypes.Boolean
    q6WouldYouVoteInFavorOfLegislation: EntryFieldTypes.Boolean
    q7VoteInFavorOfLegisToPaymentStablecoins: EntryFieldTypes.Boolean
    q8ShareAnyOtherOpinionsOnCrypto: EntryFieldTypes.Text
  }
}

const logger = getLogger(`contentfulQuestionnaire`)
export async function getQuestionnaire(DTSISlug: string) {
  try {
    const entries = await contentfulClient.getEntries<QuestionnaireEntrySkeleton>({
      content_type: 'swcQuestionnaire',
      'fields.slug': DTSISlug,
    })

    const isValidResponse = zodQuestionnaireSchemaValidation.safeParse(entries)

    // Using safeParse to prevent logging errors when a politician hasn't answered the questionnaire yet.
    if (!isValidResponse.success) return null

    return entries.items[0]
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
