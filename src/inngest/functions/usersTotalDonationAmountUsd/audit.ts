import { Decimal } from '@prisma/client/runtime/library'
import * as Sentry from '@sentry/nextjs'
import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { NFTSlug } from '@/utils/shared/nft'

const AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE =
  Number(process.env.AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE) || 2000

const AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_FUNCTION_ID =
  'script.audit-users-total-donation-amount-usd'
const AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_RETRY_LIMIT = 5

const BATCH_BUFFER = 1.15
const TWO_DECIMALS = 2
/**
 * This function is used to audit the total donation amount in USD for all users. This is purposed as a cron-job.
 * Notes:
 * - In general, this function was written with the cost implications and limitations of PlanetScale, Inngest, and Vercel serverless functions in mind.
 * - We do not use `datetime_created` when fetching users because the query ends violates the 100000 row query limit.
 * - We do not use a WHERE clause to only fetch donated users (or only donation-related actions) because that query ends up being very slow with a large dataset, which might cost us in GB-HRs.
 * - We do not return a full list of users from the different step functions because of Inngest payload size limitations/issues and GB-HRs costs.
 * - We use a fan-out pattern to process all users in batches because Inngest has a 1000 step call limit per function.
 * - We use `step.invoke` (asynchronous) instead of `step.sendEvent` (synchronous) to avoid inadvertent connection pooling exhaustion.
 * - We include a buffer when fetching users in case more users get added in the middle during the auditing process. It is safe to reprocess.
 */
export const auditUsersTotalDonationAmountUsdInngest = inngest.createFunction(
  {
    id: AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_FUNCTION_ID,
    retries: AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_RETRY_LIMIT,
    onFailure: onScriptFailure,
  },
  {
    cron: '0 4 */3 * *', // Every 3 days at 4:00 AM
  },
  async ({ step }) => {
    const usersCount = await step.run('get-users-count', async () => {
      return prismaClient.user.count()
    })

    const userCursors = []
    let userCursor = ''
    for (
      let i = 0;
      i < usersCount * BATCH_BUFFER;
      i += AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE
    ) {
      const row = await step.run(`get-user-cursor-${i}`, async () => {
        return prismaClient.user.findFirst({
          select: { id: true },
          orderBy: { id: 'asc' },
          ...(userCursor.length > 0 && {
            cursor: { id: userCursor },
            skip: AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE,
          }),
        })
      })
      if (row) {
        userCursors.push(row.id)
        userCursor = row.id
      } else {
        break
      }
    }

    for (const cursor of userCursors) {
      await step.invoke(`send-batch-of-users-${cursor}`, {
        function: auditUsersTotalDonationAmountUsdInngestAuditBatchOfUsers,
        data: {
          userCursor: cursor,
        },
      })
    }
  },
)

const AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE =
  Number(process.env.AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE) || 100

const AUDIT_USER_BATCH_FUNCTION_ID =
  'script.audit-users-total-donation-amount-usd.audit-batch-of-users'
export const AUDIT_USER_BATCH_EVENT_NAME =
  'script/audit.users.total.donation.amount.usd/audit.batch.of.users'

export const auditUsersTotalDonationAmountUsdInngestAuditBatchOfUsers = inngest.createFunction(
  {
    id: AUDIT_USER_BATCH_FUNCTION_ID,
    retries: AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_RETRY_LIMIT,
    onFailure: onScriptFailure,
  },
  {
    event: AUDIT_USER_BATCH_EVENT_NAME,
  },
  async ({ event, step }) => {
    if (!event.data.userCursor) {
      throw new NonRetriableError('missing user cursor in event data')
    }
    const currentCursor = event.data.userCursor
    const numMiniBatches =
      Math.ceil(
        AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE /
          AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE,
      ) * BATCH_BUFFER
    for (let i = 1; i <= numMiniBatches; i++) {
      await step.run(`audit-users-total-donation-amount-usd-${i}`, async () => {
        const relevantUsers = await prismaClient.user.findMany({
          select: {
            id: true,
            totalDonationAmountUsd: true,
            userActions: {
              select: {
                nftMint: { select: { nftSlug: true, costAtMintUsd: true } },
                userActionDonation: { select: { amountUsd: true } },
              },
            },
          },
          cursor: { id: currentCursor },
          skip: (i - 1) * AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE,
          take: AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE,
          orderBy: { id: 'asc' },
        })
        if (relevantUsers.length === 0) {
          return
        }
        await auditUsers(relevantUsers)
      })
    }
  },
)

async function auditUsers(
  relevantUsers: {
    id: string
    totalDonationAmountUsd: Decimal
    userActions: {
      userActionDonation: {
        amountUsd: Decimal
      } | null
      nftMint: {
        nftSlug: string
        costAtMintUsd: Decimal
      } | null
    }[]
  }[],
) {
  for (const relevantUser of relevantUsers) {
    const totalDonationAmountUsd = relevantUser.userActions.reduce((acc, userAction) => {
      return (
        acc +
        (userAction.nftMint?.nftSlug === NFTSlug.STAND_WITH_CRYPTO_LEGACY ||
        userAction.nftMint?.nftSlug === NFTSlug.STAND_WITH_CRYPTO_SUPPORTER
          ? userAction.nftMint?.costAtMintUsd.toNumber() || 0
          : 0) +
        (userAction.userActionDonation?.amountUsd.toNumber() || 0)
      )
    }, 0)
    if (
      // We round to 2 decimal places to avoid floating point false alarms and because we only care about cents.
      relevantUser.totalDonationAmountUsd.toNumber().toFixed(TWO_DECIMALS) !==
      totalDonationAmountUsd.toFixed(TWO_DECIMALS)
    ) {
      Sentry.captureMessage("Discrepancy found in user's total USD donation amount", {
        level: 'warning',
        extra: {
          userId: relevantUser.id,
          expected: totalDonationAmountUsd.toFixed(TWO_DECIMALS),
          actual: relevantUser.totalDonationAmountUsd.toNumber().toFixed(TWO_DECIMALS),
        },
      })
    }
  }
}
