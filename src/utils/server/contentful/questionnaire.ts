import { getLogger } from '@/utils/shared/logger'
import { contentfulClient } from '@/utils/server/contentful/client'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import * as Sentry from '@sentry/nextjs'
import { EntryFieldTypes } from 'contentful'

const CONTENTFUL_QUESTIONNAIRE_ENTRY_ID = requiredOutsideLocalEnv(
  process.env.CONTENTFUL_QUESTIONNAIRE_ENTRY_ID,
  'CONTENTFUL_QUESTIONNAIRE_ENTRY_ID',
  'all contentful related',
)!

export type QuestionnaireEntrySkeleton = {
  contentTypeId: 'swcQuestionnaire'
  fields: {
    slug: EntryFieldTypes.Text
    q1: EntryFieldTypes.Boolean
    q2: EntryFieldTypes.Boolean
    q3: EntryFieldTypes.Boolean
    q4: EntryFieldTypes.Boolean
    q5: EntryFieldTypes.Boolean
    q6: EntryFieldTypes.Boolean
    q7: EntryFieldTypes.Boolean
    q8: EntryFieldTypes.Text
  }
}

const logger = getLogger(`contentfulQuestionnaire`)
export async function getQuestionnaire(DTSISlug: string) {
  try {
    // const entry = await contentfulClient.getEntry<QuestionnaireEntrySkeleton>(
    //   CONTENTFUL_QUESTIONNAIRE_ENTRY_ID,
    // )
    const entries = await contentfulClient.getEntries<QuestionnaireEntrySkeleton>({
      content_type: 'swcQuestionnaire',
      'fields.slug': DTSISlug,
    })
    console.log(DTSISlug)
    if (entries.total > 0) {
      return entries.items[0]
    } else {
      return null
    }
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
