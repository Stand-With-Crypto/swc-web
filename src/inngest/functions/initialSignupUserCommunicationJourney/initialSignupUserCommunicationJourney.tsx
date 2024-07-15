import { UserActionType, UserCommunicationJourneyType } from '@prisma/client'
import { render } from '@react-email/components'
import * as Sentry from '@sentry/nextjs'
import { isBefore, subMinutes } from 'date-fns'
import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

import { sendMail } from '@/lib/email'
import { EmailActiveActions } from '@/lib/email/templates/common/constants'
import InitialSignUpEmail from '@/lib/email/templates/initialSignUp'

export const INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME =
  'app/user.communication/initial.signup'
const INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID =
  'user-communication/initial-signup'

const MAX_RETRY_COUNT = 2
const LATEST_ACTION_DEBOUNCE_TIME_MINUTES = 5

export interface InitialSignUpUserCommunicationJourneyPayload {
  userId: string
}

export const initialSignUpUserCommunicationJourney = inngest.createFunction(
  {
    id: INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
    onFailure: onScriptFailure,
  },
  { event: INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = event.data as InitialSignUpUserCommunicationJourneyPayload
    if (!payload.userId) {
      throw new NonRetriableError('userId not provided')
    }

    const userCommunicationJourney = await step.run('create-communication-journey', () =>
      createCommunicationJourney(payload.userId),
    )

    let done = false
    do {
      await step.sleep('wait-5-mins', '5 mins')
      const response = await step.run('check-latest-user-action-date', async () => {
        const userAction = await getLatestUserAction(payload.userId)
        return {
          isPastDebounceTime:
            !!userAction &&
            isBefore(
              userAction.datetimeCreated,
              subMinutes(new Date(), LATEST_ACTION_DEBOUNCE_TIME_MINUTES),
            ),
          // This is here only for debugging purposes through the Inngest Dashboard
          userAction,
        }
      })
      done = response.isPastDebounceTime
    } while (!done)

    await step.run('send-mail', async () =>
      sendInitialSignupEmail({
        userId: payload.userId,
        userCommunicationJourneyId: userCommunicationJourney.id,
      }),
    )
  },
)

async function createCommunicationJourney(userId: string) {
  const existingCommunicationJourney = await prismaClient.userCommunicationJourney.findFirst({
    where: {
      userId,
      journeyType: UserCommunicationJourneyType.INITIAL_SIGNUP,
    },
  })

  if (existingCommunicationJourney) {
    throw new NonRetriableError('UserCommunicationJourney already exists')
  }

  return prismaClient.userCommunicationJourney.create({
    data: {
      userId,
      journeyType: UserCommunicationJourneyType.INITIAL_SIGNUP,
    },
  })
}

async function getLatestUserAction(userId: string) {
  return prismaClient.userAction.findFirst({
    where: {
      userId,
    },
    orderBy: {
      datetimeCreated: 'desc',
    },
  })
}

const ACTIVE_ACTIONS = [
  UserActionType.CALL,
  UserActionType.EMAIL,
  UserActionType.DONATION,
  UserActionType.NFT_MINT,
  UserActionType.VOTER_REGISTRATION,
]

async function sendInitialSignupEmail({
  userId,
  userCommunicationJourneyId,
}: {
  userId: string
  userCommunicationJourneyId: string
}) {
  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      primaryUserEmailAddress: true,
      userActions: true,
      userSessions: true,
    },
  })

  if (!user.primaryUserEmailAddress) {
    Sentry.captureMessage('Tried to send an email to a user without primaryUserEmailAddress', {
      extra: { userId: user.id },
      fingerprint: ['initialSignupUserCommunicationJourney'],
      tags: {
        domain: 'initialSignupUserCommunicationJourney',
      },
    })
    throw new NonRetriableError('User does not have a primary email address')
  }

  const messageId = await sendMail({
    to: user.primaryUserEmailAddress.emailAddress,
    subject: 'Welcome to Stand With Crypto',
    html: render(
      <InitialSignUpEmail
        completedActionTypes={user.userActions
          .filter(action => !ACTIVE_ACTIONS.includes(action.actionType))
          .map(action => `${action.actionType}` as EmailActiveActions)}
        session={
          user.userSessions[0]?.id
            ? {
                userId: user.id,
                sessionId: user.userSessions[0].id,
              }
            : null
        }
      />,
    ),
  }).catch(err => {
    Sentry.captureException(err, {
      extra: { userId: user.id, emailTo: user.primaryUserEmailAddress!.emailAddress },
      tags: {
        domain: 'initialSignupUserCommunicationJourney',
      },
      fingerprint: ['initialSignupUserCommunicationJourney', 'sendMail'],
    })
    throw err
  })

  return prismaClient.userCommunication.create({
    data: {
      userCommunicationJourneyId,
      messageId,
    },
  })
}
