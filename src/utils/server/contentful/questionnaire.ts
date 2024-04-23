import * as Sentry from '@sentry/nextjs'
import { EntryFieldTypes } from 'contentful'

import { contentfulClient } from '@/utils/server/contentful/client'
import { getLogger } from '@/utils/shared/logger'

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
    const entries = await contentfulClient.getEntries({
      content_type: 'swcQuestionnaire',
      'fields.slug': DTSISlug,
    })
    console.log({ entries })
    // if (entries.total > 0) {
    //   return entries.items[0]
    // } else {
    //   return null
    // }

    return null
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
