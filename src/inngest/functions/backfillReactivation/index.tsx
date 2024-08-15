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
}

const BACKFILL_REACTIVATION_INNGEST_EVENT_NAME = 'script/backfill-reactivation'
const BACKFILL_REACTIVATION_INNGEST_FUNCTION_ID = 'script.backfill-reactivation'
const BACKFILL_SESSION_ID_BATCH_SIZE = Number(process.env.BACKFILL_SESSION_ID_BATCH_SIZE) || 5000

const logger = getLogger('backfillReactivation')

export const backfillReactivationWithInngest = inngest.createFunction(
  {
    id: BACKFILL_REACTIVATION_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: BACKFILL_REACTIVATION_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = event.data as ScriptPayload
    const { testEmail, persist } = payload

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
        })
      },
    )

    if (!persist) {
      logger.info('Dry run')
      logger.info(
        `Would send initial sign up email to ${usersWithoutCommunicationJourneyCount} users`,
      )
      return {
        results: [],
        message: `Would send initial sign up email to ${usersWithoutCommunicationJourneyCount} users`,
      }
    }

    const numBatches = Math.ceil(
      usersWithoutCommunicationJourneyCount / BACKFILL_SESSION_ID_BATCH_SIZE,
    )

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

    for (let i = 0; i < numBatches; i++) {
      const result: {
        id: string
        userCommunicationJourneyId: string
        communicationType: CommunicationType
        messageId: string
        datetimeCreated: Date
      }[] = []

      const batchResult = await step.run(`backfill-reactivation-email-batch-${i}`, async () => {
        const usersWithoutCommunicationJourney = await prismaClient.user.findMany({
          take: BACKFILL_SESSION_ID_BATCH_SIZE,
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

        for (const user of usersWithoutCommunicationJourney) {
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
        }

        return {
          results: result,
          message: `Sent initial sign up email to ${result.length} users`,
        }
      })

      totalResult = batchResult

      logger.info(`Batch ${i} finished with: ${batchResult.message}`)
    }

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
