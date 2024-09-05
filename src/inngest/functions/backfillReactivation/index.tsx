import { CommunicationType, UserCommunicationJourneyType } from '@prisma/client'
import { render } from '@react-email/components'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { sendMail } from '@/utils/server/email'
import { EmailActiveActions } from '@/utils/server/email/templates/common/constants'
import ReactivationReminder from '@/utils/server/email/templates/reactivationReminder'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

interface ScriptPayload {
  testEmail?: string
  persist?: boolean
  limit?: number
}

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
  Number(process.env.BACKFILL_REACTIVATION_INNGEST_BATCH_SIZE) || 5000

const BACKFILL_REACTIVATION_INNGEST_CRON_JOB_ID = 'script.backfill-reactivation-cron-job'
const BACKFILL_REACTIVATION_INNGEST_CRON_JOB_SCHEDULE = 'TZ=America/New_York 0 10,11,12,13,14 * * *' // Every hour between 10AM and 2PM EST

const logger = getLogger('backfillReactivation')

export const backfillReactivationCron = inngest.createFunction(
  { id: BACKFILL_REACTIVATION_INNGEST_CRON_JOB_ID },
  { cron: BACKFILL_REACTIVATION_INNGEST_CRON_JOB_SCHEDULE },
  async ({ step }) => {
    const payload = {
      name: BACKFILL_REACTIVATION_INNGEST_EVENT_NAME,
      data: {
        persist: true,
        limit: 150,
      },
    }

    await step.sendEvent(`${BACKFILL_REACTIVATION_INNGEST_CRON_JOB_ID}-event-call`, payload)
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
  async ({ event, step }) => {
    const { testEmail, persist, limit } = event.data as ScriptPayload

    const usersWithoutCommunicationJourneyCount = await step.run(
      'get-users-without-communication-journey-count',
      async () => {
        return prismaClient.user.count({
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
          take: limit,
        })
      },
    )

    if (!persist) {
      logger.info('Dry run')
      logger.info(
        `Would send initial sign up email to ${usersWithoutCommunicationJourneyCount} users`,
      )
      return {
        message: `Would send initial sign up email to ${usersWithoutCommunicationJourneyCount} users`,
        results: [],
      }
    }

    const numBatches = limit
      ? 1
      : Math.ceil(usersWithoutCommunicationJourneyCount / BACKFILL_REACTIVATION_INNGEST_BATCH_SIZE)

    let totalResult: {
      message: string
      results: {
        id: string
        datetimeCreated: string
        userCommunicationJourneyId: string
        communicationType: CommunicationType
        messageId: string
      }[]
      errors: any[]
    } | null = null

    for (let i = 0; i < numBatches; i++) {
      const batchResult = await step.run(`backfill-reactivation-email-batch-${i}`, async () => {
        const usersWithoutCommunicationJourney = await prismaClient.user.findMany({
          take: limit || BACKFILL_REACTIVATION_INNGEST_BATCH_SIZE,
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
        })

        const messageIds = await sendBatchEmails(usersWithoutCommunicationJourney as User[])

        if (messageIds?.length > 0) {
          const emailResults = messageIds.map((messageId, index) => ({
            userId: usersWithoutCommunicationJourney[index].id,
            messageId,
          }))

          const result = await persistBatchUserCommunication(emailResults)

          return {
            message: `Sent initial sign up email to ${result.success.length} users`,
            results: result.success,
            errors: result.errors,
          }
        }

        return {
          message: 'No emails sent',
          results: [],
          errors: [],
        }
      })

      totalResult = batchResult
      logger.info(`Batch ${i} finished with: ${batchResult.message}`)
    }

    return totalResult
  },
)

async function persistBatchUserCommunication(emailResults: EmailResult[]) {
  const errors: any[] = []

  await prismaClient.userCommunicationJourney
    .createMany({
      data: emailResults.map(({ userId }) => ({
        userId,
        journeyType: UserCommunicationJourneyType.INITIAL_SIGNUP,
        campaignName: UserCommunicationJourneyType.INITIAL_SIGNUP,
      })),
    })
    .catch(error => {
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

  await prismaClient.userCommunication
    .createMany({
      data: journeys.map(({ id, userId }) => ({
        messageId: emailResults.find(result => result.userId === userId)!.messageId,
        communicationType: CommunicationType.EMAIL,
        userCommunicationJourneyId: id,
      })),
    })
    .catch(error => {
      errors.push(error)
    })

  const createdCommunications = await prismaClient.userCommunication.findMany({
    where: {
      userCommunicationJourneyId: {
        in: journeys.map(({ id }) => id),
      },
    },
    select: {
      id: true,
      userCommunicationJourneyId: true,
      communicationType: true,
      messageId: true,
      datetimeCreated: true,
    },
  })

  return {
    success: createdCommunications,
    errors,
  }
}

async function sendBatchEmails(users: User[]) {
  const emailsPayload = users.map(user => {
    const userSession = user.userSessions?.[0]
    const completedActionTypes = user.userActions
      .filter(action => Object.values(EmailActiveActions).includes(action.actionType))
      .map(action => action.actionType as EmailActiveActions)
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
