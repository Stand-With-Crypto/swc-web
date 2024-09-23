import { CommunicationType, UserCommunicationJourneyType } from '@prisma/client'
import { render } from '@react-email/components'
import * as Sentry from '@sentry/nextjs'
import { chunk } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { sendMail } from '@/utils/server/email'
import { EmailActiveActions } from '@/utils/server/email/templates/common/constants'
import ReactivationReminder from '@/utils/server/email/templates/reactivationReminder'
import { prismaClient } from '@/utils/server/prismaClient'

interface EmailResult {
  userId: string
  messageId: string
}

interface User {
  id: string
  primaryUserEmailAddress: {
    emailAddress: string
  }
  userActions: {
    actionType: EmailActiveActions
  }[]
  userSessions: {
    id: string
    userId: string
  }[]
}

const BACKFILL_REACTIVATION_INNGEST_EVENT_NAME = 'script/backfill-reactivation'
const BACKFILL_REACTIVATION_INNGEST_FUNCTION_ID = 'script.backfill-reactivation'
const BACKFILL_REACTIVATION_INNGEST_BATCH_SIZE =
  Number(process.env.BACKFILL_REACTIVATION_INNGEST_BATCH_SIZE) || 50

export type BackfillReactivationInngestSchema = {
  name: typeof BACKFILL_REACTIVATION_INNGEST_EVENT_NAME
  data: {
    testEmail?: string
    persist?: boolean
    limit?: number
  }
}

const BACKFILL_REACTIVATION_INNGEST_CRON_JOB_ID = 'script.backfill-reactivation-cron-job'
const BACKFILL_REACTIVATION_INNGEST_CRON_JOB_SCHEDULE =
  'TZ=America/New_York 0 11,12,13,14,15,16,17 * * *' // Every hour between 11AM and 5PM EST

export const backfillReactivationCron = inngest.createFunction(
  { id: BACKFILL_REACTIVATION_INNGEST_CRON_JOB_ID },
  { cron: BACKFILL_REACTIVATION_INNGEST_CRON_JOB_SCHEDULE },
  async ({ step }) => {
    await step.sendEvent(`${BACKFILL_REACTIVATION_INNGEST_CRON_JOB_ID}-event-call`, {
      name: BACKFILL_REACTIVATION_INNGEST_EVENT_NAME,
      data: {
        persist: true,
        limit: 1500,
      },
    })
  },
)

export const backfillReactivationWithInngest = inngest.createFunction(
  {
    id: BACKFILL_REACTIVATION_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  {
    event: BACKFILL_REACTIVATION_INNGEST_EVENT_NAME,
  },
  async ({ event, step, logger }) => {
    const { testEmail, persist, limit } = event.data

    const usersWithoutCommunicationJourney = await step.run(
      'get-users-without-communication-journey',
      async () =>
        await prismaClient.user.findMany({
          take: limit,
          orderBy: {
            datetimeCreated: 'desc',
          },
          where: {
            ...(testEmail
              ? {
                  primaryUserEmailAddress: {
                    emailAddress: testEmail,
                  },
                }
              : {
                  primaryUserEmailAddress: {
                    isNot: null,
                  },
                }),
            NOT: {
              UserCommunicationJourney: {
                some: {
                  journeyType: UserCommunicationJourneyType.INITIAL_SIGNUP,
                },
              },
            },
          },
          include: {
            primaryUserEmailAddress: true,
            userActions: true,
            userSessions: true,
            address: true,
          },
        }),
    )

    const payloadChunks = chunk(
      usersWithoutCommunicationJourney,
      BACKFILL_REACTIVATION_INNGEST_BATCH_SIZE,
    )

    if (!persist) {
      logger.info('Dry run')
      logger.info(
        `Would send initial sign up email to ${usersWithoutCommunicationJourney.length} users in ${payloadChunks.length} batches`,
      )
      return {
        message: `Would send initial sign up email to ${usersWithoutCommunicationJourney.length} users in ${payloadChunks.length} batches`,
        results: [],
      }
    }

    let totalUsers = 0
    const errors: unknown[] = []

    for (let i = 0; i < payloadChunks.length; i += 1) {
      const currentPayloadChunk = payloadChunks[i]

      const messageIds = await step.run(
        `send-batch-emails-${i}`,
        async () => await sendBatchEmails(currentPayloadChunk as User[]),
      )

      if (messageIds?.length > 0) {
        const emailResults = messageIds.map((messageId, index) => ({
          userId: currentPayloadChunk[index].id,
          messageId,
        }))

        const result = await step.run(
          `persist-batch-user-communication-${i}`,
          async () => await persistBatchUserCommunication(emailResults),
        )

        totalUsers += result.success?.count ?? 0
        errors.push(...result.errors)
      }
    }

    return {
      message: `Sent initial sign up email to ${totalUsers} users in ${payloadChunks.length} batches`,
      errors,
    }
  },
)

async function persistBatchUserCommunication(emailResults: EmailResult[]) {
  const errors: unknown[] = []

  await prismaClient.userCommunicationJourney
    .createMany({
      data: emailResults.map(({ userId }) => ({
        userId,
        journeyType: UserCommunicationJourneyType.INITIAL_SIGNUP,
        campaignName: UserCommunicationJourneyType.INITIAL_SIGNUP,
      })),
    })
    .catch(error => {
      Sentry.captureException(error, {
        tags: {
          domain: 'backfillReactivationEmail',
          message: 'error creating userCommunicationJourney',
        },
      })
      errors.push(error)
    })

  const journeys = await prismaClient.userCommunicationJourney.findMany({
    where: {
      userId: {
        in: emailResults.map(({ userId }) => userId),
      },
      journeyType: UserCommunicationJourneyType.INITIAL_SIGNUP,
      campaignName: UserCommunicationJourneyType.INITIAL_SIGNUP,
    },
    select: {
      id: true,
      userId: true,
    },
    distinct: ['userId'],
  })

  const userCommunicationCreatedCount = await prismaClient.userCommunication
    .createMany({
      data: journeys.map(({ id, userId }) => ({
        messageId: emailResults.find(result => result.userId === userId)!.messageId,
        communicationType: CommunicationType.EMAIL,
        userCommunicationJourneyId: id,
      })),
    })
    .catch(error => {
      Sentry.captureException(error, {
        tags: {
          domain: 'backfillReactivationEmail',
          message: 'error creating userCommunication',
        },
      })
      errors.push(error)
    })

  return {
    success: userCommunicationCreatedCount,
    errors,
  }
}

async function sendBatchEmails(users: User[]) {
  const emailsPayload = users.map(user => {
    const userSession = user.userSessions?.[0]
    const completedActionTypes = user.userActions
      .filter(action => Object.values(EmailActiveActions).includes(action.actionType))
      .map(action => action.actionType)
    const currentSession = userSession
      ? {
          userId: userSession.userId,
          sessionId: userSession.id,
        }
      : null

    return {
      to: user.primaryUserEmailAddress.emailAddress,
      subject: ReactivationReminder.subjectLine,
      customArgs: {
        userId: user.id,
        category: 'Reactivation Email Reminder',
      },
      html: render(
        <ReactivationReminder
          completedActionTypes={completedActionTypes}
          session={currentSession}
        />,
      ),
    }
  })

  return await sendMail(emailsPayload)
}
