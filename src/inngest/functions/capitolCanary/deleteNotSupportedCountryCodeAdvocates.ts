import { NonRetriableError } from 'inngest'
import { chunk } from 'lodash-es'
import { z } from 'zod'

import { CAPITOL_CANARY_SUPPORTED_COUNTRY_CODES } from '@/inngest/functions/capitolCanary/constants'
import { inngest } from '@/inngest/inngest'
import {
  updateAdvocateInCapitolCanary,
  UpdateAdvocateInCapitolCanaryRequest,
} from '@/utils/server/capitolCanary/updateAdvocate'
import { prismaClient } from '@/utils/server/prismaClient'

const CAPITOL_CANARY_DELETE_NOT_SUPPORTED_COUNTRY_CODE_ADVOCATES_INNGEST_FUNCTION_ID =
  'capitol-canary.delete-not-supported-country-code-advocates'
export const CAPITOL_CANARY_DELETE_NOT_SUPPORTED_COUNTRY_CODE_ADVOCATES_INNGEST_EVENT_NAME =
  'capitol.canary/delete.not.supported.country.code.advocates'

const deleteNotSupportedCountryCodeAdvocatesPayloadSchema = z.object({
  limit: z.number().max(10_000).default(10_000).optional(),
  persist: z.boolean().optional(),
})

type DeleteNotSupportedCountryCodeAdvocatesPayload = z.infer<
  typeof deleteNotSupportedCountryCodeAdvocatesPayloadSchema
>

export interface CapitolCanaryDeleteNotSupportedCountryCodeAdvocatesInngestSchema {
  name: typeof CAPITOL_CANARY_DELETE_NOT_SUPPORTED_COUNTRY_CODE_ADVOCATES_INNGEST_EVENT_NAME
  data: DeleteNotSupportedCountryCodeAdvocatesPayload
}

export const deleteNotSupportedCountryCodeAdvocates = inngest.createFunction(
  {
    id: CAPITOL_CANARY_DELETE_NOT_SUPPORTED_COUNTRY_CODE_ADVOCATES_INNGEST_FUNCTION_ID,
  },
  { event: CAPITOL_CANARY_DELETE_NOT_SUPPORTED_COUNTRY_CODE_ADVOCATES_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = deleteNotSupportedCountryCodeAdvocatesPayloadSchema.safeParse(event.data)
    if (!payload.success) {
      throw new NonRetriableError('Invalid payload', {
        cause: payload.error,
      })
    }

    const { limit, persist } = payload.data

    if (!persist) {
      return {
        totalCount: await prismaClient.user.count({
          where: {
            countryCode: {
              notIn: CAPITOL_CANARY_SUPPORTED_COUNTRY_CODES,
            },
            capitolCanaryAdvocateId: {
              not: null,
            },
          },
        }),
      }
    }

    const users = await prismaClient.user.findMany({
      where: {
        countryCode: {
          notIn: CAPITOL_CANARY_SUPPORTED_COUNTRY_CODES,
        },
        capitolCanaryAdvocateId: {
          not: null,
        },
      },
      include: {
        address: true,
      },
      take: limit,
    })

    const usersChunks = chunk(users, 10)
    for (let i = 0; i < usersChunks.length; i++) {
      await step.run(`add-delete-tag-on-capitol-canary-${i + 1}`, async () => {
        const promises = usersChunks[i].map(user => {
          const formattedUpdateRequest: UpdateAdvocateInCapitolCanaryRequest = {
            advocateid: user.capitolCanaryAdvocateId!,
            tags: [`countryCode:${user.countryCode}`, 'toDelete'],
          }
          return updateAdvocateInCapitolCanary(formattedUpdateRequest)
        })

        return Promise.allSettled(promises)
      })
    }
  },
)
