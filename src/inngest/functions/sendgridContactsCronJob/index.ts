import { NonRetriableError } from 'inngest'

import { checkCustomFields } from '@/inngest/functions/sendgridContactsCronJob/checkCustomFields'
import {
  checkSendgridJobStatus,
  SendgridImportJobStatusResponse,
} from '@/inngest/functions/sendgridContactsCronJob/checkJobStatus'
import {
  COUNTRIES_TO_SYNC,
  DB_READ_LIMIT,
} from '@/inngest/functions/sendgridContactsCronJob/config'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  fetchSendgridContactList,
  getSendgridContactListName,
} from '@/utils/server/sendgrid/marketing/lists'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { syncSendgridContactsProcessor } from './logic'

export const SYNC_SENDGRID_CONTACTS_COORDINATOR_INNGEST_EVENT_NAME =
  'script/sync-sendgrid-contacts-coordinator'
export const SYNC_SENDGRID_CONTACTS_COORDINATOR_FUNCTION_ID =
  'script.sync-sendgrid-contacts-coordinator'
const SYNC_SENDGRID_CONTACTS_COORDINATOR_CRON_JOB_SCHEDULE = '0 */6 * * *' // every 6 hours

const SENDGRID_RATE_LIMIT = 4

export interface SyncSendgridContactsCoordinatorSchema {
  name: typeof SYNC_SENDGRID_CONTACTS_COORDINATOR_INNGEST_EVENT_NAME
}

interface BatchResult {
  success: boolean
  jobId: string | null
  validContactsCount?: number
  method?: string
  error?: string
  usersCount?: number
}

interface CountryProcessingResult {
  countryCode: SupportedCountryCodes
  totalUsers: number
  fulfilledBatches: BatchResult[]
  failedBatches: BatchResult[]
  errors: PromiseSettledResult<BatchResult>[]
}

export const syncSendgridContactsCoordinator = inngest.createFunction(
  { id: SYNC_SENDGRID_CONTACTS_COORDINATOR_FUNCTION_ID, onFailure: onScriptFailure },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: SYNC_SENDGRID_CONTACTS_COORDINATOR_CRON_JOB_SCHEDULE }
      : { event: SYNC_SENDGRID_CONTACTS_COORDINATOR_INNGEST_EVENT_NAME }),
  },
  async ({ step, logger }) => {
    await step.run('ensure-custom-fields-exist', async () => {
      try {
        return await checkCustomFields()
      } catch (error) {
        logger.error('Custom Fields check failed', { error })
        throw new NonRetriableError(`Custom Fields check failed`)
      }
    })

    const countriesResults = []
    for (const countryCode of COUNTRIES_TO_SYNC) {
      const countryResult = await processCountry(countryCode, step, logger)
      countriesResults.push(countryResult)
    }

    const jobIdsToMonitor = countriesResults
      .flatMap(result =>
        result.fulfilledBatches.filter(batch => batch.jobId).map(batch => batch.jobId),
      )
      .filter(Boolean)

    let sendgridJobResults: PromiseSettledResult<SendgridImportJobStatusResponse>[] = []
    if (jobIdsToMonitor.length > 0) {
      sendgridJobResults = await step.run('check-all-sendgrid-job-statuses', async () => {
        const statusPromises = jobIdsToMonitor.map(jobId => checkSendgridJobStatus(jobId))
        return await Promise.allSettled(statusPromises)
      })
    } else {
      logger.info('No SendGrid jobs were submitted; skipping status check phase.')
    }

    return {
      countriesResults,
      sendgridJobResults,
    }
  },
)

async function processCountry(
  countryCode: SupportedCountryCodes,
  step: any,
  logger: any,
): Promise<CountryProcessingResult> {
  const contactListId = await step.run(`[${countryCode}]-get-contact-list-id`, async () => {
    const list = await fetchSendgridContactList(getSendgridContactListName(countryCode))
    return list.id
  })

  const userCount = await step.run(`[${countryCode}]-count-users`, async () => {
    return prismaClient.user.count({
      where: {
        countryCode,
        primaryUserEmailAddress: { emailAddress: { not: '' }, isVerified: true },
      },
    })
  })

  if (userCount === 0) {
    logger.info(`No users found for country code ${countryCode}, skipping.`)
    return {
      countryCode,
      totalUsers: 0,
      fulfilledBatches: [],
      failedBatches: [],
      errors: [],
    }
  }

  const numDbChunks = Math.ceil(userCount / DB_READ_LIMIT)
  logger.info(
    `Processing ${countryCode} users in ${numDbChunks} batches of up to ${DB_READ_LIMIT} users each`,
  )

  const batchResults: BatchResult[] = []
  let requestsSent = 0
  for (let chunkIndex = 0; chunkIndex < numDbChunks; chunkIndex++) {
    const take = DB_READ_LIMIT
    const skip = chunkIndex * DB_READ_LIMIT

    logger.info(
      `Processing batch ${chunkIndex + 1}/${numDbChunks} for ${countryCode}: skip=${skip}, take=${take}`,
    )

    const batchResult = await step.invoke(`[${countryCode}]-sync-contacts.batch-${chunkIndex}`, {
      function: syncSendgridContactsProcessor,
      data: {
        countryCode,
        batchParams: { skip, take },
        contactListId,
      },
    })
    logger.info(`Batch ${chunkIndex + 1} result:`, batchResult)
    batchResults.push(batchResult)
    requestsSent++
    if (requestsSent >= SENDGRID_RATE_LIMIT) {
      logger.info(`Waiting for ${SENDGRID_RATE_LIMIT} to avoid rate limiting`)
      await step.sleep(10000)
      requestsSent = 0
    }
  }

  const successfulBatches: BatchResult[] = []
  const failedBatches: BatchResult[] = []
  const errors: PromiseSettledResult<BatchResult>[] = []

  for (const batchResult of batchResults) {
    if (batchResult.success) {
      successfulBatches.push(batchResult)
    } else {
      failedBatches.push(batchResult)
    }
  }

  return {
    countryCode,
    totalUsers: userCount,
    fulfilledBatches: successfulBatches,
    failedBatches,
    errors,
  }
}
