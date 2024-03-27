import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE =
  Number(process.env.AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE) || 250

const AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_FUNCTION_ID =
  'script.audit-users-total-donation-amount-usd'
const AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_RETRY_LIMIT = 5

const logger = getLogger('auditUsersTotalDonationAmountUsdCronJob')

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
    // Get all users' total donation amount in USD where they have some non-zero NFT mint or donation.
    const usersCount = await step.run('get-users-count', async () => {
      logger.info('getting relevant users count')
      const count = await prismaClient.user.count({
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
        orderBy: { id: 'asc' },
      })
      logger.info(`users count: ${count}`)
      return count
    })

    let batchNum = 1
    const batches = Math.ceil(usersCount / AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE)
    for (let i = 0; i < batches; i++) {
      // Get the relevant users for this batch.
      const relevantUsers = await step.run(`get-users-${batchNum}`, async () => {
        logger.info(`processing batch ${batchNum} of ${batches}`)
        return prismaClient.user.findMany({
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
          skip: (batchNum - 1) * AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE,
          take: AUDIT_USERS_TOTAL_DONATION_AMOUNT_USD_BATCH_SIZE,
          orderBy: { id: 'asc' },
        })
      })

      await step.run(`update-users-total-donation-amount-usd-${batchNum}`, async () => {
        // Calculate the total donation amount in USD for each user.
        const newUserDonationAmounts = []
        for (const user of relevantUsers) {
          const totalDonationAmountUsd = user.userActions.reduce((acc, userAction) => {
            return (
              acc +
              (Number(userAction.nftMint?.costAtMintUsd) || 0) +
              (Number(userAction.userActionDonation?.amountUsd) || 0)
            )
          }, 0)
          if ((Number(user.totalDonationAmountUsd) || 0) !== totalDonationAmountUsd) {
            newUserDonationAmounts.push({
              id: user.id,
              totalDonationAmountUsd,
            })
          }
        }

        // Update the total donation amount in USD for each user.
        const updatePromises = newUserDonationAmounts.map(newUser => {
          return prismaClient.user.update({
            where: { id: newUser.id },
            data: { totalDonationAmountUsd: newUser.totalDonationAmountUsd },
          })
        })

        // Wait for all the updates to complete.
        await Promise.all(updatePromises)
      })

      batchNum += 1
    }
  },
)
