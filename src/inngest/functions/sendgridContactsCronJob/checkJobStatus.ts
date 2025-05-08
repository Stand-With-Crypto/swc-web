import * as Sentry from '@sentry/nextjs'

import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'
import { logger } from '@/utils/shared/logger'

const POLLING_INTERVAL_MS = 15000
const MAX_POLLS = 240 // Max polling for 1 hour (15s * 240 = 3600s = 60 minutes)

interface ImportJobResults {
  requested_count?: number
  created_count?: number
  updated_count?: number
  deleted_count?: number
  errored_count?: number
  errors_url?: string
}

export interface SendgridImportJobStatusResponse {
  id: string
  status: 'pending' | 'completed' | 'failed' | 'errored'
  jobType: 'upsert' | 'delete'
  results?: ImportJobResults
  startedAt: string
  finishedAt?: string
}

export async function checkSendgridJobStatus(
  jobId: string,
): Promise<SendgridImportJobStatusResponse> {
  logger.info(
    `Starting to monitor SendGrid job ${jobId}. Polling every ${
      POLLING_INTERVAL_MS / 1000
    }s for up to ${MAX_POLLS} attempts.`,
  )

  for (let pollCount = 1; pollCount <= MAX_POLLS; pollCount++) {
    let jobStatusResponse: SendgridImportJobStatusResponse
    try {
      const [response] = await SendgridClient.request({
        url: `/v3/marketing/contacts/imports/${jobId}`,
        method: 'GET',
      })
      jobStatusResponse = response.body as SendgridImportJobStatusResponse

      if (!jobStatusResponse.status) {
        const noStatusError = `SendGrid job ${jobId} response missing 'status' field on poll attempt ${pollCount}.`
        logger.error(noStatusError, { jobId, pollCount, responseBody: jobStatusResponse })
        Sentry.captureMessage(noStatusError, {
          extra: {
            jobId,
            pollCount,
            response: jobStatusResponse,
          },
          tags: { domain: 'SendgridMarketing' },
        })
        throw new Error(noStatusError)
      }

      logger.info(
        `Poll attempt ${pollCount}/${MAX_POLLS} for SendGrid job ${jobId}. Status: ${jobStatusResponse.status}`,
        {
          jobId,
          status: jobStatusResponse.status,
        },
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error(
        `API error during poll attempt ${pollCount} for SendGrid job ${jobId}: ${errorMessage}`,
        {
          error: errorMessage,
          jobId,
        },
      )
      Sentry.captureException(error, {
        extra: { jobId, pollCount },
        tags: { domain: 'SendgridMarketing' },
      })
      throw new Error(errorMessage)
    }

    const currentStatus = jobStatusResponse.status

    if (currentStatus !== 'pending') {
      if (currentStatus === 'failed' || currentStatus === 'errored') {
        const errorDetails = jobStatusResponse?.results?.errors_url
        const errorMessage = `SendGrid job ${jobId} ended with status '${currentStatus}'. ${errorDetails ? `Details: ${errorDetails}` : ''}`
        logger.error(errorMessage, { jobId, response: jobStatusResponse })
        Sentry.captureMessage(errorMessage, {
          extra: {
            jobId,
            jobStatus: currentStatus,
            response: jobStatusResponse,
            errorDetailsURL: errorDetails,
          },
          tags: {
            domain: 'SendgridMarketing',
          },
        })
        throw new Error(errorMessage, {
          cause: errorDetails,
        })
      }
      logger.info(`SendGrid job ${jobId} is no longer pending. Final status: ${currentStatus}.`)
      return jobStatusResponse
    }

    if (pollCount < MAX_POLLS) {
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS))
    }
  }

  const timeoutMessage = `SendGrid job ${jobId} remained 'pending' after ${MAX_POLLS} polls (${
    (MAX_POLLS * POLLING_INTERVAL_MS) / 1000 / 60
  } minutes).`
  logger.error(timeoutMessage, { jobId })
  Sentry.captureMessage(timeoutMessage, {
    extra: { jobId },
    tags: { domain: 'SendgridMarketingJobStatus' },
    level: 'error',
  })
  throw new Error(timeoutMessage)
}
