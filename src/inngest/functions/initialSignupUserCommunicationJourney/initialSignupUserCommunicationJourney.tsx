import { CommunicationType, UserActionType, UserCommunicationJourneyType } from '@prisma/client'
import { render } from '@react-email/components'
import * as Sentry from '@sentry/nextjs'
import { isBefore, subMinutes } from 'date-fns'
import { NonRetriableError } from 'inngest'
import { z } from 'zod'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { sendMail } from '@/utils/server/email'
import BecomeMemberReminderEmail from '@/utils/server/email/templates/becomeMemberReminder'
import { EmailActiveActions } from '@/utils/server/email/templates/common/constants'
import ContactYourRepresentativeReminderEmail from '@/utils/server/email/templates/contactYourRepresentativeReminder'
import FinishSettingUpProfileReminderEmail from '@/utils/server/email/templates/finishSettingUpProfileReminder'
import FollowOnXReminderEmail from '@/utils/server/email/templates/followOnXReminder'
import InitialSignUpEmail from '@/utils/server/email/templates/initialSignUp'
import PhoneNumberReminderEmail from '@/utils/server/email/templates/phoneNumberReminder'
import { prismaClient } from '@/utils/server/prismaClient'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME =
  'app/user.communication/initial.signup'
const INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID =
  'user-communication.initial-signup'

const initialSignUpUserCommunicationJourneyPayload = z.object({
  userId: z.string(),
  sessionId: z.string().optional().nullable(),
  decreaseTimers: z.boolean().default(false).optional(),
})

const MAX_RETRY_COUNT = 2
const LATEST_ACTION_DEBOUNCE_TIME_MINUTES = 5
const STEP_FOLLOW_UP_TIMEOUT_MINUTES = '7d'
const FAST_STEP_FOLLOW_UP_TIMEOUT_MINUTES = '3 mins'

type InitialSignupUserCommunicationDataSchema = z.infer<
  typeof initialSignUpUserCommunicationJourneyPayload
>

export interface InitialSignupUserCommunicationSchema {
  name: typeof INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME
  data: InitialSignupUserCommunicationDataSchema
}

export const initialSignUpUserCommunicationJourney = inngest.createFunction(
  {
    id: INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
    onFailure: onScriptFailure,
  },
  { event: INITIAL_SIGNUP_USER_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = await initialSignUpUserCommunicationJourneyPayload
      .parseAsync(event.data)
      .catch(err => {
        throw new NonRetriableError(err.message ?? 'Invalid payload')
      })

    const userCommunicationJourney = await step.run('create-communication-journey', () =>
      createCommunicationJourney(payload.userId),
    )

    const userForCountryCodeCheck = await getUser(payload.userId)
    // TODO: remove this once we have templates for all countries
    if (userForCountryCodeCheck.countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE) {
      return
    }

    let done = false
    do {
      await step.sleep('wait-5-mins', `${LATEST_ACTION_DEBOUNCE_TIME_MINUTES} mins`)
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
        sessionId: payload.sessionId,
        userCommunicationJourneyId: userCommunicationJourney.id,
        step: 'welcome',
      }),
    )

    const followUpTimeout = payload.decreaseTimers
      ? FAST_STEP_FOLLOW_UP_TIMEOUT_MINUTES
      : STEP_FOLLOW_UP_TIMEOUT_MINUTES
    await step.sleep('wait-for-welcome-follow-up', followUpTimeout)

    let profileStatus = await getProfileStatus(payload.userId)
    if (profileStatus === 'incomplete') {
      await step.run('send-finish-profile-reminder', async () =>
        sendInitialSignUpEmail({
          userId: payload.userId,
          sessionId: payload.sessionId,
          userCommunicationJourneyId: userCommunicationJourney.id,
          step: 'update-profile-reminder',
        }),
      )
      await step.sleep('wait-for-finish-profile-reminder-follow-up', followUpTimeout)
      profileStatus = await getProfileStatus(payload.userId)
    }

    if (profileStatus === 'incomplete' || profileStatus === 'partially-complete') {
      await step.run('send-phone-number-reminder', async () =>
        sendInitialSignUpEmail({
          userId: payload.userId,
          sessionId: payload.sessionId,
          userCommunicationJourneyId: userCommunicationJourney.id,
          step: 'phone-number-reminder',
        }),
      )
      await step.sleep('wait-for-phone-number-reminder-follow-up', followUpTimeout)
    }

    const user = await getUser(payload.userId)
    if (!user.hasOptedInToMembership) {
      await step.run('send-membership-reminder', async () =>
        sendInitialSignUpEmail({
          userId: payload.userId,
          sessionId: payload.sessionId,
          userCommunicationJourneyId: userCommunicationJourney.id,
          step: 'membership-reminder',
        }),
      )
      await step.sleep('wait-for-membership-reminder-follow-up', followUpTimeout)
    }

    const hasFollowedOnX = await hasUserCompletedAction(payload.userId, UserActionType.TWEET)
    if (!hasFollowedOnX) {
      await step.run('send-follow-on-x-reminder', async () =>
        sendInitialSignUpEmail({
          userId: payload.userId,
          sessionId: payload.sessionId,
          userCommunicationJourneyId: userCommunicationJourney.id,
          step: 'follow-on-x-reminder',
        }),
      )
      await step.sleep('wait-for-follow-on-x-reminder-follow-up', followUpTimeout)
    }

    const hasCalledAndEmailed =
      (await hasUserCompletedAction(payload.userId, UserActionType.CALL)) &&
      (await hasUserCompletedAction(payload.userId, UserActionType.EMAIL))
    if (!hasCalledAndEmailed) {
      await step.run('send-contact-your-rep-reminder', async () =>
        sendInitialSignUpEmail({
          userId: payload.userId,
          sessionId: payload.sessionId,
          userCommunicationJourneyId: userCommunicationJourney.id,
          step: 'contact-your-rep-reminder',
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

async function hasUserCompletedAction(userId: string, actionType: UserActionType) {
  const action = await prismaClient.userAction.findFirst({
    where: {
      userId,
      actionType,
    },
  })

  return !!action
}

const ACTIVE_ACTIONS = [
  UserActionType.CALL,
  UserActionType.EMAIL,
  UserActionType.DONATION,
  UserActionType.NFT_MINT,
  UserActionType.VOTER_REGISTRATION,
]

const TEMPLATE_BY_STEP = {
  welcome: InitialSignUpEmail,
  'update-profile-reminder': FinishSettingUpProfileReminderEmail,
  'phone-number-reminder': PhoneNumberReminderEmail,
  'membership-reminder': BecomeMemberReminderEmail,
  'follow-on-x-reminder': FollowOnXReminderEmail,
  'contact-your-rep-reminder': ContactYourRepresentativeReminderEmail,
}

type InitialSignUpEmailStep = keyof typeof TEMPLATE_BY_STEP

async function sendInitialSignUpEmail({
  userId,
  sessionId,
  userCommunicationJourneyId,
  step,
}: {
  userCommunicationJourneyId: string
  step: InitialSignUpEmailStep
} & Pick<InitialSignupUserCommunicationDataSchema, 'userId' | 'sessionId'>) {
  const user = await getUser(userId)

  // TODO: remove this once we have templates for all countries
  if (!user.primaryUserEmailAddress || user.countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE) {
    return null
  }

  const Template = TEMPLATE_BY_STEP[step]
  const messageId = await sendMail({
    countryCode: user.countryCode,
    payload: {
      to: user.primaryUserEmailAddress.emailAddress,
      subject: Template.subjectLine,
      html: await render(
        <Template
          completedActionTypes={user.userActions
            .filter(action => ACTIVE_ACTIONS.includes(action.actionType))
            .map(action => `${action.actionType}` as EmailActiveActions)}
          session={
            sessionId
              ? {
                  userId: user.id,
                  sessionId,
                }
              : null
          }
        />,
      ),
      customArgs: {
        userId: user.id,
        campaign: Template.campaign,
      },
    },
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
