import { analyzeCryptoRelatedBillsWithRetry } from '@/inngest/functions/stateLevelBillsCronJob/ai'
import {
  AI_ANALYSIS_MIN_SCORE,
  MAX_BILLS_TO_PROCESS,
  QUORUM_API_BILLS_PER_PAGE,
  SEARCH_OFFSET_REDIS_KEY,
  SEARCH_OFFSET_REDIS_TTL,
  STATE_LEVEL_BILLS_CRON_JOB_SCHEDULE,
} from '@/inngest/functions/stateLevelBillsCronJob/config'
import { CRYPTO_RELATED_KEYWORDS_REGEX } from '@/inngest/functions/stateLevelBillsCronJob/constants'
import {
  createBillEntryInBuilderIO,
  fetchBuilderIOBills,
  fetchQuorumBills,
  fetchQuorumBillSummaries,
  parseQuorumBillToBuilderIOPayload,
  updateBillEntryInBuilderIO,
} from '@/inngest/functions/stateLevelBillsCronJob/logic'
import {
  CreateBillEntryPayload,
  UpdateBillEntryPayload,
} from '@/inngest/functions/stateLevelBillsCronJob/types'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { redis } from '@/utils/server/redis'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { BillSource } from '@/utils/shared/zod/getSWCBills'

export const STATE_LEVEL_BILLS_SOURCING_AUTOMATION_INNGEST_EVENT_NAME =
  'script/state-level-bills-sourcing-automation'
export const STATE_LEVEL_BILLS_SOURCING_AUTOMATION_INNGEST_FUNCTION_ID =
  'script.state-level-bills-sourcing-automation'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

export const stateLevelBillsSourcingAutomation = inngest.createFunction(
  {
    id: STATE_LEVEL_BILLS_SOURCING_AUTOMATION_INNGEST_FUNCTION_ID,
    onFailure: onScriptFailure,
  },
  {
    ...((NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: STATE_LEVEL_BILLS_CRON_JOB_SCHEDULE }
      : { event: STATE_LEVEL_BILLS_SOURCING_AUTOMATION_INNGEST_EVENT_NAME }) as any),
  },
  async ({ step, logger }) => {
    const billsFromQuorum = await step.run('retrieve-bills-data-from-quorum', async () => {
      logger.info('Starting to fetch bills from Quorum API...')

      const bills = []

      let hasMoreData = true

      let pageIndex = 0

      while (hasMoreData) {
        logger.info(`Fetching page ${pageIndex + 1}...`)

        const paginationParams = {
          limit: QUORUM_API_BILLS_PER_PAGE,
          offset: pageIndex * QUORUM_API_BILLS_PER_PAGE,
        }

        const results = await fetchQuorumBills(paginationParams)

        logger.info(`Fetched ${results.objects.length} bills from Quorum API.`)

        bills.push(...results.objects)

        pageIndex++

        if (results.objects.length < QUORUM_API_BILLS_PER_PAGE || results.meta.next === null) {
          hasMoreData = false
        }
      }

      const lastBill = bills.at(-1)

      if (lastBill) {
        await redis.set(SEARCH_OFFSET_REDIS_KEY, lastBill.id, { ex: SEARCH_OFFSET_REDIS_TTL })
      }

      logger.info(`Completed fetching bills from Quorum API. Total bills fetched: ${bills.length}.`)

      return bills
    })

    const billsFromBuilderIO = await step.run('retrieve-bills-data-from-builder-io', async () => {
      logger.info('Starting to fetch existing bills from Builder.io...')

      const billsFromBuilderIO = await fetchBuilderIOBills(countryCode)

      logger.info(
        `Completed fetching bills from Builder.io. Total bills fetched: ${billsFromBuilderIO.length}.`,
      )

      return billsFromBuilderIO
    })

    const validBillsFromQuorum = await step.run('validate-bills-data-from-quorum', async () => {
      logger.info('Starting to validate Quorum bills...')

      const validBillsFromQuorum = billsFromQuorum.filter(bill => {
        return CRYPTO_RELATED_KEYWORDS_REGEX.test(bill.title)
      })

      logger.info(`Completed validation. Total valid Quorum bills: ${validBillsFromQuorum.length}.`)

      return validBillsFromQuorum
    })

    const quorumBillSummaries = await step.run(
      'retrieve-bill-summaries-data-from-quorum',
      async () => {
        logger.info('Starting to fetch bill summaries from Quorum API...')

        const billSummaries = []

        let hasMoreData = true

        let pageIndex = 0

        while (hasMoreData) {
          logger.info(`Fetching page ${pageIndex + 1}...`)

          const paginationParams = {
            limit: QUORUM_API_BILLS_PER_PAGE,
            offset: pageIndex * QUORUM_API_BILLS_PER_PAGE,
          }

          const results = await fetchQuorumBillSummaries(validBillsFromQuorum, paginationParams)

          logger.info(`Fetched ${results.objects.length} bill summaries from Quorum API.`)

          billSummaries.push(...results.objects)

          pageIndex++

          if (results.objects.length < QUORUM_API_BILLS_PER_PAGE || results.meta.next === null) {
            hasMoreData = false
          }
        }

        logger.info(
          `Completed fetching bill summaries from Quorum API. Total bill summaries fetched: ${billSummaries.length}.`,
        )

        return billSummaries
      },
    )

    const validBillsFromQuorumWithSummary = await step.run(
      'merge-quorum-bills-with-summaries',
      async () => {
        logger.info('Starting to merge bills information with their corresponding summaries...')

        const validBillsFromQuorumWithSummary = validBillsFromQuorum.map(bill => ({
          ...bill,
          summaries: quorumBillSummaries.filter(
            summary => summary.bill.split('/').at(-2) === String(bill.id),
          ),
        }))

        logger.info('Completed merge.')

        return validBillsFromQuorumWithSummary
      },
    )

    const allParsedBillsFromQuorum = await step.run('parse-bills-data-from-quorum', async () => {
      logger.info('Starting to parse valid Quorum bills...')

      const allParsedBillsFromQuorum = validBillsFromQuorumWithSummary.map(
        parseQuorumBillToBuilderIOPayload,
      )

      logger.info(
        `Completed parsing. Total parsed Quorum bills: ${allParsedBillsFromQuorum.length}.`,
      )

      return allParsedBillsFromQuorum
    })

    const parsedBillsFromQuorum = MAX_BILLS_TO_PROCESS
      ? allParsedBillsFromQuorum.slice(0, MAX_BILLS_TO_PROCESS)
      : allParsedBillsFromQuorum

    const [billsToAnalyze, billsToUpdate] = await step.run('analyze-bills-data', async () => {
      const quorumBillsInBuilderIO = billsFromBuilderIO.filter(
        bill => bill.data.source === BillSource.QUORUM && bill.data.externalId,
      )
      const existingQuorumIdsInBuilderIO = new Set(
        quorumBillsInBuilderIO.map(bill => bill.data.externalId as string),
      )

      logger.info(
        `Found ${billsFromBuilderIO.length} bills in Builder.io, with ${existingQuorumIdsInBuilderIO.size} unique Quorum IDs.`,
      )

      const billsToAnalyze = parsedBillsFromQuorum
        .filter(
          quorumBill => !existingQuorumIdsInBuilderIO.has(quorumBill.data.externalId as string),
        )
        .map(quorumBill => ({
          ...quorumBill,
          originalIndex: billsFromQuorum.findIndex(
            ({ id }) => String(id) === quorumBill.data.externalId,
          ),
        }))

      const billsToUpdate = parsedBillsFromQuorum
        .map(quorumBill => ({
          ...quorumBill,
          builderIO: quorumBillsInBuilderIO.find(
            ({ data }) => data.externalId === quorumBill.data.externalId,
          ),
        }))
        .filter(quorumBill => {
          return (
            existingQuorumIdsInBuilderIO.has(quorumBill.data.externalId as string) &&
            quorumBill.builderIO &&
            quorumBill.builderIO.data.isAutomaticUpdatesEnabled !== false &&
            quorumBill.builderIO.data.mostRecentActionDate !== quorumBill.data.mostRecentActionDate
          )
        })
        .map(quorumBill => ({
          id: quorumBill.builderIO!.id,
          data: quorumBill,
        })) as { id: string; data: UpdateBillEntryPayload }[]

      logger.info(`Found ${billsToAnalyze.length} new bills to analyze using AI.`)
      logger.info(`Found ${billsToUpdate.length} existing bills to update in Builder.io.`)

      return [billsToAnalyze, billsToUpdate] as const
    })

    const { aiScores, billsToCreate } = await step.run('analyze-bills-data-with-ai', async () => {
      logger.info('Starting to analyze valid Quorum bills using AI...')

      const offsetId = await redis.get<number | undefined>(SEARCH_OFFSET_REDIS_KEY)
      const offsetIndex =
        typeof offsetId === 'number'
          ? parsedBillsFromQuorum.findIndex(bill => bill.data.externalId === String(offsetId))
          : -1
      const filteredBillsToAnalyze =
        offsetIndex === -1
          ? billsToAnalyze
          : billsToAnalyze.filter(bill => bill.originalIndex > offsetIndex)
      const filteredBillsToAnalyzeWithoutIndex = filteredBillsToAnalyze.map(
        ({ originalIndex: _, ...data }) => data,
      ) as CreateBillEntryPayload[]

      const aiScores = await analyzeCryptoRelatedBillsWithRetry(
        filteredBillsToAnalyzeWithoutIndex.map(bill => ({
          externalId: bill.data.externalId as string,
          summary: bill.data.summary,
          title: bill.data.title,
        })),
        logger,
      )

      logger.info(`Completed analyzing. Total analyzed Quorum bills: ${aiScores.length}.`)

      return {
        aiScores,
        billsToCreate: aiScores
          .filter(score => score.score >= AI_ANALYSIS_MIN_SCORE)
          .map(score =>
            filteredBillsToAnalyzeWithoutIndex.find(bill => bill.data.externalId === score.id),
          ) as CreateBillEntryPayload[],
      }
    })

    const createdBills = await step.run('create-new-bill-entries-in-builder-io', async () => {
      logger.info('Starting to create new bill entries in Builder.io...')

      const promises = billsToCreate.map(async bill => {
        try {
          const result = await createBillEntryInBuilderIO(bill)
          logger.info(`Created new bill entry in Builder.io: ${result.id}.`)
        } catch (error) {
          logger.error(
            `Error creating bill entry in Builder.io: ${error instanceof Error ? error.message : String(error)}.`,
          )
        }
      })

      const result = await Promise.allSettled(promises)

      const createdBills = result.filter(({ status }) => status === 'fulfilled')

      logger.info(`Created ${createdBills.length} new bill entries in Builder.io.`)

      return createdBills
    })

    const updatedBills = await step.run('update-existing-bill-entries-in-builder-io', async () => {
      logger.info('Starting to update existing bill entries in Builder.io...')

      const promises = billsToUpdate.map(async bill => {
        try {
          const result = await updateBillEntryInBuilderIO(bill.id, bill.data)
          logger.info(`Updated existing bill entry in Builder.io: ${result.id}.`)
        } catch (error) {
          logger.error(
            `Error updating bill entry in Builder.io: ${error instanceof Error ? error.message : String(error)}.`,
          )
        }
      })

      const result = await Promise.allSettled(promises)

      const updatedBills = result.filter(({ status }) => status === 'fulfilled')

      logger.info(`Updated ${updatedBills.length} existing bill entries in Builder.io.`)

      return updatedBills
    })

    logger.info('State-level bills sourcing automation completed successfully.')

    const billsToCreateOrUpdateCount = billsToCreate.length + billsToUpdate.length
    const successRate = billsToCreateOrUpdateCount
      ? ((createdBills.length + updatedBills.length) * 100) / billsToCreateOrUpdateCount
      : 100

    return {
      aiScores,
      builderIO: {
        created: createdBills.length,
        current: billsFromBuilderIO.length + createdBills.length,
        previous: billsFromBuilderIO.length,
        updated: updatedBills.length,
      },
      cleanup: {
        ai: billsToAnalyze.length - billsToCreate.length,
        regex: billsFromQuorum.length - validBillsFromQuorum.length,
      },
      errors: {
        create: billsToCreate.length - createdBills.length,
        update: billsToUpdate.length - updatedBills.length,
      },
      matches: {
        new: billsToCreate.length,
        previous: validBillsFromQuorum.length - billsToAnalyze.length,
        total: billsToCreate.length + validBillsFromQuorum.length - billsToAnalyze.length,
      },
      quorum: {
        invalid:
          billsFromQuorum.length -
          validBillsFromQuorum.length +
          billsToAnalyze.length -
          billsToCreate.length,
        total: billsFromQuorum.length,
        valid: validBillsFromQuorum.length - billsToAnalyze.length + billsToCreate.length,
      },
      rates: {
        error: parseFloat((100 - successRate).toFixed(2)),
        success: parseFloat(successRate.toFixed(2)),
      },
    }
  },
)
