import {
  CommunicationType,
  Prisma,
  PrismaClient,
  UserCommunicationJourneyType,
} from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { render } from '@react-email/components'
import * as Sentry from '@sentry/nextjs'
import { NonRetriableError } from 'inngest'
import { number, object, z } from 'zod'

import { sendMail } from '@/utils/server/email'
import { EmailActiveActions } from '@/utils/server/email/templates/common/constants'
import ReactivationReminder from '@/utils/server/email/templates/reactivationReminder'
import { prismaClient } from '@/utils/server/prismaClient'
import { batchAsyncAndLog } from '@/utils/shared/batchAsyncAndLog'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('backfillReactivation')

export const zodBackfillReactivationParameters = object({
  limit: number().optional(),
  recursive: z.boolean(),
  testEmail: z.string().optional(),
  persist: z.boolean().optional(),
})

let isFirstRun = true
let affectedUsers = 0
let results: (
  | {
      messageId: string
      email: string
      userId: string
      communicationJourneyId: string
      information: string
    }
  | null
  | undefined
)[][] = []

export async function backfillReactivation(
  parameters: z.infer<typeof zodBackfillReactivationParameters>,
) {
  zodBackfillReactivationParameters.parse(parameters)
  const { limit, recursive, testEmail, persist } = parameters

  const usersWithoutCommunicationJourney = await prismaClient.user.findMany({
    ...(limit && { take: limit }),
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

  if (!persist) {
    logger.info('Dry run')
    logger.info(
      `Would send initial sign up email to ${usersWithoutCommunicationJourney.length} users`,
    )
    return {
      results: results.flat(),
      message: `Would send initial sign up email to ${usersWithoutCommunicationJourney.length} users`,
    }
  }

  if (usersWithoutCommunicationJourney.length === 0) {
    logger.info(
      isFirstRun ? 'No users found.' : `Process completed. Affected users: ${affectedUsers}`,
    )
    return {
      results: results.flat(),
      message: `Process completed. Affected users: ${affectedUsers}`,
    }
  }

  const result = await batchAsyncAndLog(usersWithoutCommunicationJourney, users =>
    Promise.all(
      users.map(user =>
        sendInitialSignUpEmail({
          userId: user.id,
          userCommunicationJourneyId: UserCommunicationJourneyType.INITIAL_SIGNUP,
        }),
      ),
    ),
  )

  if (result) {
    results.push(result.flat())
  }

  isFirstRun = false

  if (recursive) {
    logger.info('Running recursively')
    return await backfillReactivation(parameters)
  }

  return {
    message: `Process completed. Affected users: ${affectedUsers}`,
    results: results.flat(),
  }
}

async function sendInitialSignUpEmail({
  userId,
  userCommunicationJourneyId,
}: {
  userId: string
  userCommunicationJourneyId: string
}) {
  const user = await getUser(userId)

  return await prismaClient.$transaction(async client => {
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

    const messageId = await sendMail({
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

    if (messageId) {
      const communicationJourney = await createCommunicationJourney(
        client,
        userId,
        messageId,
        userCommunicationJourneyId,
      )

      affectedUsers += 1

      return Promise.resolve({
        messageId,
        email: user.primaryUserEmailAddress.emailAddress,
        userId: communicationJourney.userId,
        communicationJourneyId: communicationJourney.id,
        information: `Sent initial sign up email to ${user.primaryUserEmailAddress.emailAddress}`,
      })
    }
  })
}

async function createCommunicationJourney(
  client: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  userId: string,
  messageId: string,
  userCommunicationJourneyId: string,
) {
  const existingCommunicationJourney = await client.userCommunicationJourney.findFirst({
    where: {
      userId,
      journeyType: UserCommunicationJourneyType.INITIAL_SIGNUP,
    },
  })

  if (existingCommunicationJourney) {
    throw new NonRetriableError('UserCommunicationJourney already exists')
  }

  await client.userCommunication.create({
    data: {
      messageId,
      userCommunicationJourneyId,
      communicationType: CommunicationType.EMAIL,
    },
  })

  return client.userCommunicationJourney.create({
    data: {
      userId,
      journeyType: UserCommunicationJourneyType.INITIAL_SIGNUP,
    },
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
