'use server'
import 'server-only'

import {
  Prisma,
  User,
  UserActionType,
  UserCryptoAddress,
  UserEmailAddress,
  UserEmailAddressSource,
  UserInformationVisibility,
} from '@prisma/client'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/emailViaCapitolCanary'
import { inngest } from '@/inngest/inngest'
import { CapitolCanaryCampaignId } from '@/utils/server/capitolCanary/campaigns'
import { EmailViaCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import {
  AnalyticsUserActionUserState,
  getServerAnalytics,
  getServerPeopleAnalytics,
} from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookies,
  ServerLocalUser,
} from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { userFullName } from '@/utils/shared/userFullName'
import { zodUserActionFormEmailCNNFields } from '@/validation/forms/zodUserActionFormEmailCNN'

const logger = getLogger(`actionCreateUserActionEmailCNN`)

const CNN_EMAIL = 'community@cnn.com'

type UserWithRelations = User & {
  primaryUserCryptoAddress: UserCryptoAddress | null
  userEmailAddresses: UserEmailAddress[]
}
type Input = z.infer<typeof zodUserActionFormEmailCNNFields>

export const actionCreateUserActionEmailCNN = withServerActionMiddleware(
  'actionCreateUserActionEmailCNN',
  _actionCreateUserActionEmailCNN,
)

async function _actionCreateUserActionEmailCNN(input: Input) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'unauthenticated',
  })

  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: { primaryUserCryptoAddress: true, userEmailAddresses: true, address: true },
    },
  })
  logger.info(userMatch.user ? 'found user' : 'no user found')
  const sessionId = getUserSessionId()
  const validatedFields = zodUserActionFormEmailCNNFields.safeParse(input)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  logger.info('validated fields')

  const localUser = parseLocalUserFromCookies()
  const { user, userState } = await maybeUpsertUser({
    existingUser: userMatch.user,
    input: validatedFields.data,
    sessionId,
    localUser,
    onUpsertUser: triggerRateLimiterAtMostOnce,
  })
  const analytics = getServerAnalytics({ userId: user.id, localUser })
  const peopleAnalytics = getServerPeopleAnalytics({ userId: user.id, localUser })
  const beforeFinish = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  if (localUser) {
    peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }
  logger.info('fetched/created user')
  const campaignName = validatedFields.data.campaignName
  const actionType = UserActionType.EMAIL
  let userAction = await prismaClient.userAction.findFirst({
    where: {
      actionType,
      campaignName,
      userId: user.id,
    },
    include: {
      userActionEmail: true,
    },
  })
  if (userAction && process.env.USER_ACTION_BYPASS_SPAM_CHECK !== 'true') {
    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      reason: 'Too Many Recent',
      creationMethod: 'On Site',
      userState,
    })
    await beforeFinish()
    return { user: getClientUser({ ...user, address: null }) }
  }

  await triggerRateLimiterAtMostOnce()

  userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType,
      campaignName: validatedFields.data.campaignName,
      ...('userCryptoAddress' in userMatch && userMatch.userCryptoAddress
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sessionId } } }),
      userActionEmail: {
        create: {
          senderEmail: validatedFields.data.emailAddress,
          firstName: validatedFields.data.firstName,
          lastName: validatedFields.data.lastName,
          userActionEmailRecipients: {
            create: {
              emailAddress: CNN_EMAIL,
            },
          },
        },
      },
    },
    include: {
      userActionEmail: true,
    },
  })
  analytics.trackUserActionCreated({
    actionType,
    campaignName,
    creationMethod: 'On Site',
    userState,
  })
  peopleAnalytics.set({
    // https://docs.mixpanel.com/docs/data-structure/user-profiles#reserved-user-properties
    $email: validatedFields.data.emailAddress,
    $name: userFullName(validatedFields.data),
  })

  /**
   * Send email via Capitol Canary, and add user to Capitol Canary email subscriber list.
   * Inngest will create a new advocate in Capitol Canary if we do not have the user's advocate ID, or will reuse an existing advocate.
   * By this point, the email address and physical address should have been added to our database.
   */
  const payload: EmailViaCapitolCanaryPayloadRequirements = {
    campaignId: CapitolCanaryCampaignId.CNN_EMAIL,
    user: {
      ...user,
    },
    userEmailAddress: user.userEmailAddresses.find(
      emailAddr => emailAddr.emailAddress === validatedFields.data.emailAddress,
    ),
    opts: {
      isEmailOptin: true,
    },
    emailSubject: validatedFields.data.subject,
    emailMessage: validatedFields.data.message,
  }
  await inngest.send({
    name: CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME,
    data: payload,
  })

  await beforeFinish()
  return { user: getClientUser({ ...user, address: null }) }
}

async function maybeUpsertUser({
  existingUser,
  input,
  sessionId,
  localUser,
  onUpsertUser,
}: {
  existingUser: UserWithRelations | null
  input: Input
  sessionId: string
  localUser: ServerLocalUser | null
  onUpsertUser: () => Promise<void> | void
}): Promise<{ user: UserWithRelations; userState: AnalyticsUserActionUserState }> {
  const { firstName, lastName, emailAddress } = input

  if (existingUser) {
    const updatePayload: Prisma.UserUpdateInput = {
      ...(!existingUser.hasOptedInToEmails && { hasOptedInToEmails: true }),
      ...(emailAddress &&
        existingUser.userEmailAddresses.every(addr => addr.emailAddress !== emailAddress) && {
          userEmailAddresses: {
            create: {
              emailAddress,
              isVerified: false,
              source: UserEmailAddressSource.USER_ENTERED,
            },
          },
        }),
    }
    const keysToUpdate = Object.keys(updatePayload)
    if (!keysToUpdate.length) {
      return { user: existingUser, userState: 'Existing' }
    }
    logger.info(`updating the following user fields ${keysToUpdate.join(', ')}`)
    await onUpsertUser()
    const user = await prismaClient.user.update({
      where: { id: existingUser.id },
      data: updatePayload,
      include: {
        primaryUserCryptoAddress: true,
        userEmailAddresses: true,
      },
    })

    if (!user.primaryUserEmailAddressId && emailAddress) {
      const newEmail = user.userEmailAddresses.find(addr => addr.emailAddress === emailAddress)!
      logger.info(`updating primary email`)
      await prismaClient.user.update({
        where: { id: user.id },
        data: { primaryUserEmailAddressId: newEmail.id },
      })
      user.primaryUserEmailAddressId = newEmail.id
    }
    return { user, userState: 'Existing With Updates' }
  }
  await onUpsertUser()
  const user = await prismaClient.user.create({
    include: {
      primaryUserCryptoAddress: true,
      userEmailAddresses: true,
    },
    data: {
      ...mapLocalUserToUserDatabaseFields(localUser),
      referralId: generateReferralId(),
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: true,
      hasOptedInToMembership: false,
      hasOptedInToSms: false,
      hasRepliedToOptInSms: false,
      firstName,
      lastName,
      userEmailAddresses: {
        create: {
          emailAddress,
          isVerified: false,
          source: UserEmailAddressSource.USER_ENTERED,
        },
      },
    },
  })
  const primaryUserEmailAddressId = user.userEmailAddresses[0].id
  await prismaClient.user.update({
    where: { id: user.id },
    data: {
      primaryUserEmailAddressId,
    },
  })
  user.primaryUserEmailAddressId = primaryUserEmailAddressId
  return { user, userState: 'New' }
}
