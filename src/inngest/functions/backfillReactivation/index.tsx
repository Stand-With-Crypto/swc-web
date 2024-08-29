import { CommunicationType, UserCommunicationJourneyType } from '@prisma/client'
import { render } from '@react-email/components'
import * as Sentry from '@sentry/nextjs'

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
    } | null = null

    const batchPromises = Array.from({ length: numBatches }, (_, i) =>
      step.run(`backfill-reactivation-email-batch-${i}`, async () => {
        const result: {
          id: string
          userCommunicationJourneyId: string
          communicationType: CommunicationType
          messageId: string
          datetimeCreated: Date
        }[] = []

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
          select: {
            id: true,
          },
        })

        await Promise.all(
          usersWithoutCommunicationJourney.map(async user => {
            await prismaClient.$transaction(async client => {
              const messageId = await sendInitialSignUpEmail(user.id)

              if (messageId) {
                const userCommunicationJourney = await client.userCommunicationJourney.create({
                  data: {
                    userId: user.id,
                    journeyType: UserCommunicationJourneyType.INITIAL_SIGNUP,
                  },
                })

                const userCommunication = await client.userCommunication.create({
                  data: {
                    messageId,
                    communicationType: CommunicationType.EMAIL,
                    userCommunicationJourneyId: userCommunicationJourney.id,
                  },
                })

                result.push(userCommunication)
              }
            })
          }),
        )

        return {
          message: `Sent initial sign up email to ${result.length} users`,
          results: result,
        }
      }),
    )

    const batchResults = await Promise.all(batchPromises)

    totalResult = batchResults.reduce(
      (acc, batchResult) => {
        acc.results.push(...batchResult.results)
        acc.message += `${batchResult.message}\n`
        return acc
      },
      { message: '', results: [] },
    )

    logger.info(`All batches finished with: ${totalResult.message}`)

    return totalResult
  },
)

async function sendInitialSignUpEmail(userId: string) {
  const user = await getUser(userId)

  if (!user.primaryUserEmailAddress) {
    return null
  }

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

  const ReactivationReminderComponent = ReactivationReminder

  return await sendMail({
    to: user.primaryUserEmailAddress.emailAddress,
    subject: ReactivationReminderComponent.subjectLine,
    customArgs: {
      userId: user.id,
      category: 'Reactivation Email Reminder',
    },
    html: render(
      <ReactivationReminderComponent
        completedActionTypes={completedActionTypes}
        session={currentSession}
      />,
    ),
  }).catch(err => {
    Sentry.captureException(err, {
      extra: { userId: user.id, emailTo: user.primaryUserEmailAddress!.emailAddress },
      tags: {
        domain: 'backfillReactivation',
      },
      fingerprint: ['backfillReactivation', 'sendMail'],
    })

    return Promise.reject(err)
  })
}

async function getUser(userId: string) {
  return prismaClient.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      primaryUserEmailAddress: true,
      userActions: true,
      userSessions: true,
      address: true,
    },
  })
}
