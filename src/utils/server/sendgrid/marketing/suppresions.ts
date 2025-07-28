'use server'
import 'server-only'

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

export async function removeFromGlobalSuppressionGroup(emailAddress: string) {
  if (!emailAddress) {
    throw new Error('Email address is required')
  }

  try {
    await SendgridClient.request({
      url: `/v3/asm/suppressions/global/${emailAddress}`,
      method: 'DELETE',
    })

    /**
     * This Sendgrid endpoint returns a empty body, so we're returning a message instead.
     */
    return {
      message: 'Successfully removed email from global suppression group',
    }
  } catch (error) {
    logger.error('Error removing email from global suppression group:', error)
    Sentry.captureException(error, {
      tags: {
        domain: 'SendgridMarketing',
      },
      extra: {
        emailAddress,
      },
    })
    throw error
  }
}

interface SendgridSuppressionResponse {
  body: {
    recipient_email: string
  }
}
export async function getEmailUnsubscriptionStatus(emailAddress: string) {
  const [response] = (await SendgridClient.request({
    url: `/v3/asm/suppressions/global/${emailAddress}`,
    method: 'GET',
  })) as [SendgridSuppressionResponse, unknown]

  return response.body.recipient_email
}
