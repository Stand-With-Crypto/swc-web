import { CommunicationType, UserCommunicationJourneyType } from '@prisma/client'
import { render } from '@react-email/components'
import * as Sentry from '@sentry/nextjs'
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
})

export async function backfillReactivation(
  parameters: z.infer<typeof zodBackfillReactivationParameters>,
) {
  zodBackfillReactivationParameters.parse(parameters)
  const { limit } = parameters

  const usersWithoutCommunicationJourney = await prismaClient.user.findMany({
    ...(limit && { take: limit }),
    where: {
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

  if (usersWithoutCommunicationJourney.length === 0) {
    logger.info('No users found')
    return
  }

  await batchAsyncAndLog(usersWithoutCommunicationJourney, users =>
    Promise.all(
      users.map(user =>
        sendInitialSignUpEmail({
          userId: user.id,
          userCommunicationJourneyId: UserCommunicationJourneyType.INITIAL_SIGNUP,
        }),
      ),
    ),
  )
}

async function sendInitialSignUpEmail({
  userId,
  userCommunicationJourneyId,
}: {
  userId: string
  userCommunicationJourneyId: string
}) {
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
  })

  if (messageId) {
    return prismaClient.userCommunication.create({
      data: {
        messageId,
        userCommunicationJourneyId,
        communicationType: CommunicationType.EMAIL,
      },
    })
  }
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
