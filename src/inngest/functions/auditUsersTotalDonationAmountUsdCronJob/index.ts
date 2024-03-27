import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { USD_DECIMAL_PLACES } from '@/utils/shared/usdDecimalPlaces'

const AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE =
  Number(process.env.AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE) || 1000

const AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_FUNCTION_ID =
  'script.audit-users-total-donation-amount-usd'
const AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_RETRY_LIMIT = 5

export const auditUsersTotalDonationAmountUsdCronJob = inngest.createFunction(
  {
    id: AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_FUNCTION_ID,
    retries: AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_RETRY_LIMIT,
    onFailure: onScriptFailure,
  },
  {
    cron: '0 4 * * *', // Run at 4:00 AM UTC.
  },
  async ({ step }) => {
    const usersCount = await step.run('get-users-count', async () => {
      return prismaClient.user.count({
        where: {
          userActions: {
            some: {
              OR: [
                { nftMint: { costAtMintUsd: { gt: 0 } } },
                { userActionDonation: { amountUsd: { gt: 0 } } },
              ],
            },
          },
        },
        orderBy: { datetimeCreated: 'asc' },
      })
    })

    const userCursors = await step.run('get-user-cursors', async () => {
      const userCursors = []
      for (let i = 0; i < usersCount; i += AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE) {
        const row = await prismaClient.user.findFirst({
          select: { id: true },
          where: {
            userActions: {
              some: {
                OR: [
                  { nftMint: { costAtMintUsd: { gt: 0 } } },
                  { userActionDonation: { amountUsd: { gt: 0 } } },
                ],
              },
            },
          },
          skip: i,
          orderBy: { datetimeCreated: 'asc' },
        })
        if (row) {
          userCursors.push(row.id)
        }
      }
      return userCursors
    })

    for (const userCursor of userCursors) {
      await step.sendEvent(`send-batch-of-users-${userCursor}`, {
        name: UPDATE_USER_BATCH_EVENT_NAME,
        data: {
          userCursor,
        },
      })
    }
  },
)

const AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE =
  Number(process.env.AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE) || 25

const UPDATE_USER_BATCH_FUNCTION_ID =
  'script.audit-users-total-donation-amount-usd.update-batch-of-users'
const UPDATE_USER_BATCH_EVENT_NAME =
  'script/audit.users.total.donation.amount.usd/update.batch.of.users'

export const auditUsersTotalDonationAmountUsdCronJobUpdateBatchOfUsers = inngest.createFunction(
  {
    id: UPDATE_USER_BATCH_FUNCTION_ID,
    retries: AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_RETRY_LIMIT,
    onFailure: onScriptFailure,
  },
  {
    event: UPDATE_USER_BATCH_EVENT_NAME,
  },
  async ({ event, step }) => {
    if (!event.data.userCursor) {
      throw new NonRetriableError('missing user cursor in event data')
    }
    const userCursor = event.data.userCursor
    const numMiniBatches = Math.ceil(
      AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE /
        AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE,
    )
    for (let i = 1; i <= numMiniBatches; i++) {
      await step.run(`update-users-total-donation-amount-usd-${i}`, async () => {
        const relevantUsers = await prismaClient.user.findMany({
          select: {
            id: true,
            totalDonationAmountUsd: true,
            userActions: {
              select: {
                nftMint: { select: { costAtMintUsd: true } },
                userActionDonation: { select: { amountUsd: true } },
              },
            },
          },
          where: {
            userActions: {
              some: {
                OR: [
                  { nftMint: { costAtMintUsd: { gt: 0 } } },
                  { userActionDonation: { amountUsd: { gt: 0 } } },
                ],
              },
            },
          },
          cursor: { id: userCursor },
          skip: (i - 1) * AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE,
          take: AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_MINI_BATCH_SIZE,
          orderBy: { datetimeCreated: 'asc' },
        })
        if (relevantUsers.length === 0) {
          return {
            usersCount: 0,
            usersUpdate: 0,
          }
        }

        const newUserDonationAmounts = []
        for (const user of relevantUsers) {
          const totalDonationAmountUsd = user.userActions.reduce((acc, userAction) => {
            return (
              acc +
              (Number(userAction.nftMint?.costAtMintUsd) || 0) +
              (Number(userAction.userActionDonation?.amountUsd) || 0)
            )
          }, 0)
          if (
            (Number(user.totalDonationAmountUsd.toFixed(USD_DECIMAL_PLACES)) || 0) !==
            Number(totalDonationAmountUsd.toFixed(USD_DECIMAL_PLACES))
          ) {
            newUserDonationAmounts.push({
              id: user.id,
              totalDonationAmountUsd: totalDonationAmountUsd.toFixed(USD_DECIMAL_PLACES),
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
      })
    }
  },
)
