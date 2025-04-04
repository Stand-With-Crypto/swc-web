import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { logger } from '@/utils/shared/logger'

const BACKFILL_COUNTRY_CODES_FUNCTION_ID = 'script.backfill-country-codes'
export const BACKFILL_COUNTRY_CODES_EVENT_NAME = 'script/backfill.country.codes'

export interface BackfillCountryCodesEventSchema {
  name: typeof BACKFILL_COUNTRY_CODES_EVENT_NAME
  data: {
    persist?: boolean
  }
}

export const backfillCountryCodesInngest = inngest.createFunction(
  {
    id: BACKFILL_COUNTRY_CODES_FUNCTION_ID,
    retries: 5,
    onFailure: onScriptFailure,
  },
  { event: BACKFILL_COUNTRY_CODES_EVENT_NAME },
  async ({ event, step }) => {
    const dryRun = !event.data.persist

    if (dryRun) {
      logger.info('🔍 DRY RUN MODE - Simulating updates without making database changes')
    } else {
      logger.info('💾 PERSIST MODE - Will update records in the database')
    }

    // --- GET COUNTS ---
    const [userCount, actionCount] = await Promise.all([
      step.run('count-users-non-us', async () => {
        return prismaClient.user.count({
          where: { countryCode: { not: 'us' } },
        })
      }),
      step.run('count-actions-non-us', async () => {
        return prismaClient.userAction.count({
          where: { countryCode: { not: 'us' } },
        })
      }),
    ])

    logger.info(
      `Found ${userCount} users and ${actionCount} user actions with non-US country codes`,
    )

    // --- PROCESS USERS TABLE ---
    let usersUpdated = 0
    if (userCount > 0 && !dryRun) {
      const result = await step.run('update-users', async () => {
        return prismaClient.user.updateMany({
          where: {
            countryCode: { not: 'us' },
          },
          data: {
            countryCode: 'us',
          },
        })
      })

      usersUpdated = result.count
      logger.info(`Updated ${usersUpdated} users)`)
    } else if (dryRun && userCount > 0) {
      const sample = await step.run('get-users-sample', async () => {
        return prismaClient.user.findMany({
          where: { countryCode: { not: 'us' } },
          select: { id: true, countryCode: true },
          take: 5,
        })
      })

      logger.info(
        `Would update ${userCount} users. Sample: ${JSON.stringify(sample.map(u => ({ id: u.id, from: u.countryCode, to: 'us' })))}`,
      )
    }

    // --- PROCESS USER_ACTION TABLE ---
    let actionsUpdated = 0
    if (actionCount > 0 && !dryRun) {
      const result = await step.run('update-actions', async () => {
        return prismaClient.userAction.updateMany({
          where: {
            countryCode: { not: 'us' },
          },
          data: {
            countryCode: 'us',
          },
        })
      })

      actionsUpdated = result.count
      logger.info(`Updated ${actionsUpdated} user actions`)
    } else if (dryRun && actionCount > 0) {
      const sample = await step.run('get-actions-sample', async () => {
        return prismaClient.userAction.findMany({
          where: { countryCode: { not: 'us' } },
          select: { id: true, countryCode: true },
          take: 5,
        })
      })

      logger.info(
        `Would update ${actionCount} user actions. Sample: ${JSON.stringify(sample.map(a => ({ id: a.id, from: a.countryCode, to: 'us' })))}`,
      )
    }

    logger.info(`Completed backfill`)

    return {
      dryRun,
      usersFound: userCount,
      userActionsFound: actionCount,
      usersUpdated: usersUpdated,
      userActionsUpdated: actionsUpdated,
    }
  },
)
