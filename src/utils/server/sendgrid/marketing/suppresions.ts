import * as Sentry from '@sentry/nextjs'

import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'
import { logger } from '@/utils/shared/logger'

interface SendgridSuppressionGroupResponse {
  body: {
    recipient_emails: string[]
  }
}

export async function addToGlobalSuppressionGroup(emailAddresses: string[]) {
  if (!emailAddresses.length) {
    return { recipient_emails: [] }
  }

  try {
    const [response] = (await SendgridClient.request({
      url: '/v3/asm/suppressions/global',
      method: 'POST',
      body: {
        recipient_emails: emailAddresses,
      },
    })) as [SendgridSuppressionGroupResponse, unknown]

    return response.body
  } catch (error) {
    logger.error('Error adding emails to global suppression group:', error)
    Sentry.captureException(error, {
      tags: {
        domain: 'SendgridMarketing',
      },
      extra: {
        emailsCount: emailAddresses.length,
        emailAddresses,
      },
    })
    throw error
  }
}
