import { getLogger } from '@/utils/shared/logger'
import { contentfulClient } from '@/utils/server/contentful/client'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import * as Sentry from '@sentry/nextjs'
import { Entry } from 'contentful'

const CONTENTFUL_QUESTIONNAIRE_ENTRY_ID = requiredOutsideLocalEnv(
  process.env.CONTENTFUL_QUESTIONNAIRE_ENTRY_ID,
  'CONTENTFUL_QUESTIONNAIRE_ENTRY_ID',
  'all contentful related',
)!

export interface Questionnaire {
  contentTypeId: string
  fields: {
    questions: Entry<Question>[]
    header: string
  }
}

export interface Question {
  contentTypeId: string
  fields: {
    question: string
    answers: Entry<Answer>
  }
}

export interface Answer {
  contentTypeId: string
  fields: {
    slug: string
    answer: boolean
  }
}

const logger = getLogger(`contentfulQuestionnaire`)
export async function getQuestionnaire(DTSISlug: string) {
  try {
    const entry = await contentfulClient.getEntry<Questionnaire>(CONTENTFUL_QUESTIONNAIRE_ENTRY_ID)
    return entry
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
