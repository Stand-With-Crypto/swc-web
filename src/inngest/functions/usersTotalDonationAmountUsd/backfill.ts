import { Decimal } from '@prisma/client/runtime/library'
import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { NFTSlug } from '@/utils/shared/nft'

const BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE =
  Number(process.env.BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE) || 2000

const BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_FUNCTION_ID =
  'script.backfill-users-total-donation-amount-usd'
export const BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_EVENT_NAME =
  'script/backfill.users.total.donation.amount.usd'
const BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_RETRY_LIMIT = 5

const BATCH_BUFFER = 1.15
/**
 * This function is used to backfill the total donation amount in USD for all users. This is purposed as a one-time script.
 * Notes:
 * - In general, this function was written with the cost implications and limitations of PlanetScale, Inngest, and Vercel serverless functions in mind.
 * - We do not use `datetime_created` when fetching users because the query ends violates the 100000 row query limit.
 * - We do not use a WHERE clause to only fetch donated users (or only donation-related actions) because that query ends up being very slow with a large dataset, which might cost us in GB-HRs.
 * - We do not return a full list of users from the different step functions because of Inngest payload size limitations/issues and GB-HRs costs.
 * - We use a fan-out pattern to process all users in batches because Inngest has a 1000 step call limit per function.
 * - We use `step.invoke` (asynchronous) instead of `step.sendEvent` (synchronous) to avoid inadvertent connection pooling exhaustion.
 * - We include a buffer when fetching users in case more users get added in the middle during the backfill process. It is safe to reprocess.
 * - "Why not iterate through the UserActionDonation and NFTMints tables instead of users? That would only fetch users who have actually donated."
 *   - If we had to process the tables separately, then there might be a period of time where the user's total donation amount is not accurate.
 *   - We should update the users' total donation amount in a single transaction to avoid this issue.
 * - With ~380000 rows in the users table, this function takes ~1 hour to complete.
 */
export const backfillUsersTotalDonationAmountUsdInngest = inngest.createFunction(
  {
    id: BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_FUNCTION_ID,
    retries: BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_RETRY_LIMIT,
    onFailure: onScriptFailure,
  },
  {
    event: BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_EVENT_NAME,
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
      i += BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE
    ) {
      const row = await step.run(`get-user-cursor-${i}`, async () => {
        return prismaClient.user.findFirst({
          select: { id: true },
          orderBy: { id: 'asc' },
          ...(userCursor.length > 0 && {
            cursor: { id: userCursor },
            skip: BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE,
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
        function: backfillUsersTotalDonationAmountUsdInngestUpdateBatchOfUsers,
        data: {
          userCursor: cursor,
        },
      })
    }
  },
)

const BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE =
  Number(process.env.BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE) || 100

const UPDATE_USER_BATCH_FUNCTION_ID =
  'script.backfill-users-total-donation-amount-usd.update-batch-of-users'
export const UPDATE_USER_BATCH_EVENT_NAME =
  'script/backfill.users.total.donation.amount.usd/update.batch.of.users'

export const backfillUsersTotalDonationAmountUsdInngestUpdateBatchOfUsers = inngest.createFunction(
  {
    id: UPDATE_USER_BATCH_FUNCTION_ID,
    retries: BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_RETRY_LIMIT,
    onFailure: onScriptFailure,
  },
  {
    event: UPDATE_USER_BATCH_EVENT_NAME,
  },
  async ({ event, step }) => {
    if (!event.data.userCursor) {
      throw new NonRetriableError('missing user cursor in event data')
    }
    const currentCursor = event.data.userCursor
    const numMiniBatches =
      Math.ceil(
        BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE /
          BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE,
      ) * BATCH_BUFFER
    let totalUsersCount = 0
    let totalUsersUpdate = 0
    for (let i = 1; i <= numMiniBatches; i++) {
      const { usersCount, usersUpdate } = await step.run(
        `update-users-total-donation-amount-usd-${i}`,
        async () => {
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
            skip: (i - 1) * BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE,
            take: BACKFILL_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE,
            orderBy: { id: 'asc' },
          })
          if (relevantUsers.length === 0) {
            return {
              usersCount: 0,
              usersUpdate: 0,
            }
          }
          const updateResult = await updateRelevantUsers(relevantUsers)
          return {
            usersCount: updateResult.usersCount,
            usersUpdate: updateResult.usersUpdate,
          }
        },
      )
      totalUsersCount += usersCount
      totalUsersUpdate += usersUpdate
    }
    return {
      totalUsersCount,
      totalUsersUpdate,
    }
  },
)

async function updateRelevantUsers(
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
  const newUserDonationAmounts = []
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
    if (relevantUser.totalDonationAmountUsd.toNumber() !== totalDonationAmountUsd) {
      newUserDonationAmounts.push({
        id: relevantUser.id,
        totalDonationAmountUsd: totalDonationAmountUsd,
      })
    }
  }

  const updatePromises = newUserDonationAmounts.map(newUser => {
    return prismaClient.user.update({
      where: { id: newUser.id },
      data: { totalDonationAmountUsd: newUser.totalDonationAmountUsd },
    })
  })

  if (updatePromises.length > 0) {
    await Promise.all(updatePromises)
  }

  return {
    usersCount: relevantUsers.length,
    usersUpdate: newUserDonationAmounts.length,
  }
}
