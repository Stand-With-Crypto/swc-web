import { getLogger } from '@/utils/shared/logger'
import { contentfulClient } from '@/utils/server/contentful/client'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import * as Sentry from '@sentry/nextjs'

const CONTENTFUL_QUESTIONNAIRE_ENTRY_ID = requiredOutsideLocalEnv(
  process.env.CONTENTFUL_QUESTIONNAIRE_ENTRY_ID,
  'CONTENTFUL_QUESTIONNAIRE_ENTRY_ID',
  'all contentful related',
)!

interface Questionnaire {
  contentTypeId: string
  fields: {
    Slug: string
  }
}

const logger = getLogger(`contentfulQuestionnaire`)
export async function getQuestionnaire(DTSISlug: string) {
  try {
    const entry = await contentfulClient.getEntry<Questionnaire>(CONTENTFUL_QUESTIONNAIRE_ENTRY_ID)
    logger.info(entry)
  } catch (e) {
    logger.error('error getting questionnaire entry:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'getQuestionnaire' },
      extra: { DTSISlug },
    })
    throw e
  }
}
