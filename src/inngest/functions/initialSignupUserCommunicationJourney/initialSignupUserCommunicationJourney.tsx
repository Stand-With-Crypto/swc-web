import { CommunicationType, UserActionType, UserCommunicationJourneyType } from '@prisma/client'
import { render } from '@react-email/components'
import * as Sentry from '@sentry/nextjs'
import { isBefore, subMinutes } from 'date-fns'
import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { sendMail } from '@/utils/server/email'
import BecomeMemberReminderEmail from '@/utils/server/email/templates/becomeMemberReminder'
import { EmailActiveActions } from '@/utils/server/email/templates/common/constants'
import FinishSettingUpProfileReminderEmail from '@/utils/server/email/templates/finishSettingUpProfileReminder'
import InitialSignUpEmail from '@/utils/server/email/templates/initialSignUp'
import PhoneNumberReminderEmail from '@/utils/server/email/templates/phoneNumberReminder'
import { prismaClient } from '@/utils/server/prismaClient'

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

    await step.run('send-welcome-email', async () =>
      sendInitialSignUpEmail({
        userId: payload.userId,
        userCommunicationJourneyId: userCommunicationJourney.id,
        step: 'welcome',
      }),
    )

    await step.sleep('wait-for-welcome-follow-up', '10 mins')

    let profileStatus = await getProfileStatus(payload.userId)
    if (profileStatus === 'incomplete') {
      await step.run('send-finish-profile-reminder', async () =>
        sendInitialSignUpEmail({
          userId: payload.userId,
          userCommunicationJourneyId: userCommunicationJourney.id,
          step: 'update-profile-reminder',
        }),
      )
      await step.sleep('wait-for-finish-profile-reminder-follow-up', '10 mins')
      profileStatus = await getProfileStatus(payload.userId)
    }

    if (profileStatus === 'incomplete' || profileStatus === 'partially-complete') {
      await step.run('send-finish-profile-reminder', async () =>
        sendInitialSignUpEmail({
          userId: payload.userId,
          userCommunicationJourneyId: userCommunicationJourney.id,
          step: 'phone-number-reminder',
        }),
      )
      await step.sleep('wait-for-phone-number-reminder-follow-up', '10 mins')
    }

    const user = await getUser(payload.userId)
    if (!user.hasOptedInToMembership) {
      await step.run('send-finish-profile-reminder', async () =>
        sendInitialSignUpEmail({
          userId: payload.userId,
          userCommunicationJourneyId: userCommunicationJourney.id,
          step: 'membership-reminder',
        }),
      )
    }
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

async function getProfileStatus(
  userId: string,
): Promise<'complete' | 'partially-complete' | 'incomplete'> {
  const user = await getUser(userId)
  if (hasUserCompletedProfile(user, { includingPhoneNumber: true })) {
    return 'complete'
  }

  if (hasUserCompletedProfile(user, { includingPhoneNumber: false })) {
    return 'partially-complete'
  }

  return 'incomplete'
}

const ACTIVE_ACTIONS = [
  UserActionType.CALL,
  UserActionType.EMAIL,
  UserActionType.DONATION,
  UserActionType.NFT_MINT,
  UserActionType.VOTER_REGISTRATION,
]

type InitialSignUpEmailStep =
  | 'welcome'
  | 'update-profile-reminder'
  | 'phone-number-reminder'
  | 'membership-reminder'
const TEMPLATE_BY_STEP = {
  welcome: InitialSignUpEmail,
  'update-profile-reminder': FinishSettingUpProfileReminderEmail,
  'phone-number-reminder': PhoneNumberReminderEmail,
  'membership-reminder': BecomeMemberReminderEmail,
}

async function sendInitialSignUpEmail({
  userId,
  userCommunicationJourneyId,
  step,
}: {
  userId: string
  userCommunicationJourneyId: string
  step: InitialSignUpEmailStep
}) {
  const user = await getUser(userId)

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

  const Template = TEMPLATE_BY_STEP[step]
  const messageId = await sendMail({
    to: user.primaryUserEmailAddress.emailAddress,
    subject: Template.subjectLine,
    html: render(
      <Template
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
      extra: { userId: user.id, emailTo: user.primaryUserEmailAddress!.emailAddress, step },
      tags: {
        domain: 'initialSignupUserCommunicationJourney',
      },
      fingerprint: ['initialSignupUserCommunicationJourney', 'sendMail', step],
    })
    throw err
  })

  return prismaClient.userCommunication.create({
    data: {
      userCommunicationJourneyId,
      messageId,
      communicationType: CommunicationType.EMAIL,
    },
  })
}

function hasUserCompletedProfile(
  user: Awaited<ReturnType<typeof getUser>>,
  { includingPhoneNumber }: { includingPhoneNumber: boolean },
) {
  const hasCompletedBaseProfile = Boolean(
    user.firstName && user.lastName && user.primaryUserEmailAddress && user.address,
  )

  if (includingPhoneNumber) {
    return hasCompletedBaseProfile && !!user.phoneNumber
  }

  return hasCompletedBaseProfile
}
