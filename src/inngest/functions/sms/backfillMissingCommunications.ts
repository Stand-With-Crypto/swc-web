import { CommunicationType, Prisma, UserCommunicationJourneyType } from '@prisma/client'

import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

const BACKFILL_MISSING_COMMUNICATIONS_INNGEST_FUNCTION_ID = 'script.backfill-missing-communications'
const BACKFILL_MISSING_COMMUNICATIONS_INNGEST_EVENT_NAME = 'script.backfill-missing-communications'

export interface BackfillMissingCommunicationsInngestEventSchema {
  name: typeof BACKFILL_MISSING_COMMUNICATIONS_INNGEST_EVENT_NAME
  data: {
    persist?: boolean
  }
}

const MAX_RETRY_COUNT = 0
const DATABASE_QUERY_LIMIT = 5000

export const backfillMissingCommunications = inngest.createFunction(
  {
    id: BACKFILL_MISSING_COMMUNICATIONS_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
  },
  {
    event: BACKFILL_MISSING_COMMUNICATIONS_INNGEST_EVENT_NAME,
  },
  async ({ step, event, logger }) => {
    const { persist } = event.data

    logger.info('Starting backfill missing communications script', {
      persist,
      databaseQueryLimit: DATABASE_QUERY_LIMIT,
    })

    let hasMoreUsers = true
    let skip = 0
    let iteration = 0
    let totalProcessed = 0

    while (hasMoreUsers) {
      logger.info('Starting new batch iteration', { iteration, skip })

      const createUserCommunicationsPayload = await step.run(
        `get-create-user-communications-payload-${iteration}`,
        async () => {
          // 1. Identify userCommunicationJourneys missing a userCommunication
          const usersWithMissingUserCommunications = await prismaClient.user.findMany({
            where: {
              UserCommunicationJourney: {
                some: {
                  journeyType: UserCommunicationJourneyType.WELCOME_SMS,
                  campaignName: 'bulk-welcome',
                  userCommunications: {
                    none: {},
                  },
                },
              },
            },
            include: {
              UserCommunicationJourney: {
                include: {
                  userCommunications: true,
                },
              },
            },
            take: DATABASE_QUERY_LIMIT,
            skip,
          })

          logger.info('Found users with missing communications', {
            batchSize: usersWithMissingUserCommunications.length,
            iteration,
          })

          // 2. Find a matching userCommunication reference
          let matchedCount = 0
          let unmatchedCount = 0

          const userCommunicationJourneysWithMissingUserCommunications =
            usersWithMissingUserCommunications.map(user => {
              const userCommunicationJourneyMissingUserCommunication =
                user.UserCommunicationJourney.find(
                  journey =>
                    journey.userCommunications.length === 0 &&
                    journey.campaignName === 'bulk-welcome',
                )

              if (!userCommunicationJourneyMissingUserCommunication) {
                logger.error('No userCommunicationJourneyMissingUserCommunication found', {
                  userId: user.id,
                })
                throw new Error('No userCommunicationJourneyMissingUserCommunication found')
              }

              // Search for another userCommunicationJourney with the same campaign name (bulk-welcome)
              const matchingUserCommunicationJourney = user.UserCommunicationJourney.find(
                journey =>
                  journey.campaignName === 'bulk-welcome' && journey.userCommunications.length > 0,
              )

              if (matchingUserCommunicationJourney) {
                matchedCount += 1
                return [
                  userCommunicationJourneyMissingUserCommunication,
                  matchingUserCommunicationJourney,
                ]
              }

              // If no direct match is found, locate the first BULK_SMS sent before and after the userCommunicationJourney creation date
              const missingJourneyDate =
                userCommunicationJourneyMissingUserCommunication.datetimeCreated

              const userCommunicationJourneyWithUserCommunications =
                user.UserCommunicationJourney.filter(
                  journey => journey.userCommunications.length > 0,
                ).map(journey => ({
                  ...journey,
                  userCommunications: journey.userCommunications.filter(
                    communication => communication.communicationType === CommunicationType.SMS,
                  ),
                }))

              // Find the journey with the closest creation date
              let closestJourney = userCommunicationJourneyWithUserCommunications[0]
              let smallestTimeDiff = Math.abs(
                closestJourney.datetimeCreated.getTime() - missingJourneyDate.getTime(),
              )

              for (const journey of userCommunicationJourneyWithUserCommunications) {
                const timeDiff = Math.abs(
                  journey.datetimeCreated.getTime() - missingJourneyDate.getTime(),
                )
                if (timeDiff < smallestTimeDiff) {
                  smallestTimeDiff = timeDiff
                  closestJourney = journey
                }
              }

              unmatchedCount += 1
              return [userCommunicationJourneyMissingUserCommunication, closestJourney]
            })

          logger.info('Matching results', {
            totalProcessed: userCommunicationJourneysWithMissingUserCommunications.length,
            directMatches: matchedCount,
            dateBasedMatches: unmatchedCount,
          })

          return userCommunicationJourneysWithMissingUserCommunications.map<Prisma.UserCommunicationCreateManyInput>(
            ([missingJourney, matchingJourney]) => ({
              userCommunicationJourneyId: missingJourney.id,
              communicationType: matchingJourney.userCommunications[0].communicationType,
              messageId: matchingJourney.userCommunications[0].messageId,
              status: matchingJourney.userCommunications[0].status,
            }),
          )
        },
      )

      if (persist) {
        // 3. Reference the useCommunication with the matching userCommunicationJourney
        const createdUserCommunicationsCount = await step.run(
          `create-user-communications-${iteration}`,
          async () => {
            const { count } = await prismaClient.userCommunication.createMany({
              data: createUserCommunicationsPayload,
            })

            logger.info('Created new user communications', {
              count,
              iteration,
            })

            return count
          },
        )

        totalProcessed += createdUserCommunicationsCount
      } else {
        logger.info('Dry run - skipping creation of user communications', {
          wouldCreateCount: createUserCommunicationsPayload.length,
          iteration,
        })
      }

      hasMoreUsers = createUserCommunicationsPayload.length === DATABASE_QUERY_LIMIT
      skip += DATABASE_QUERY_LIMIT
      iteration += 1

      logger.info('Batch results', {
        hasMoreUsers,
        skip,
        iteration,
        totalProcessed,
      })

      if (hasMoreUsers) {
        await step.sleep('wait-between-batches', SECONDS_DURATION['30_SECONDS'])
      }
    }

    logger.info('Completed backfill missing communications script', {
      totalIterations: iteration,
      totalProcessed,
      persist,
    })

    return `Completed backfill missing communications script with ${totalProcessed} processed`
  },
)
