'use server'
import 'server-only'

import * as Sentry from '@sentry/nextjs'

import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import {
  getZodQuestionnaireSubmitSchema,
  QuestionnaireSubmitInput,
} from '@/validation/forms/zodQuestionnaire'

const PRIVATE_KEY = requiredOutsideLocalEnv(
  process.env.BUILDER_IO_PRIVATE_KEY,
  'BUILDER_IO_PRIVATE_KEY',
  'all builder.io related',
)!

export const submitQuestionnaireAnswers = withServerActionMiddleware(
  'submitQuestionnaireAnswers',
  _submitQuestionnaireAnswers,
)

async function _submitQuestionnaireAnswers(input: QuestionnaireSubmitInput) {
  const validated = getZodQuestionnaireSubmitSchema(input.countryCode).safeParse(input)

  console.log('--- validated:', JSON.stringify(validated, null, 2))

  if (!validated.success) return { error: 'Invalid input' as const }

  const { formType, answers, ...rest } = validated.data

  const countryCode = rest.countryCode

  try {
    const payload = {
      data: {
        ...rest,
        [formType]: [
          {
            ...answers,
          },
        ],
        submittedAt: new Date().toISOString(),
      },
    }

    // TODO QUESTIONNAIRE: Centralize this model id
    const modelId = 'd065218114484de6919b4863e3e3a167'
    const name = `${countryCode}-${rest.firstName.toLowerCase()}-${rest.lastName.toLowerCase()}`

    const body = JSON.stringify({ name, modelId, ...payload })

    const res = await fetch(
      `https://builder.io/api/v1/write/${BuilderDataModelIdentifiers.QUESTIONNAIRE_V3}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PRIVATE_KEY}`,
          'Content-Type': 'application/json',
        },
        body,
      },
    )

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Builder write failed: ${res.status} ${res.statusText} ${text}`)
    }

    console.log('--- Here the message is sent to slack')

    return { success: true as const }
  } catch (e) {
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'builder.io', model: 'questionnaire' },
      extra: { countryCode, formType },
    })
    return { error: 'Failed to submit' as const }
  }
}
