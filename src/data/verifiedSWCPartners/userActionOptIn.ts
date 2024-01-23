import { prismaClient } from '@/utils/server/prismaClient'
import {
  AnalyticsUserActionUserState,
  getServerAnalytics,
  getServerPeopleAnalytics,
} from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { getUserAttributionFieldsForVerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/attribution'
import {
  VerifiedSWCPartner,
  VerifiedSWCPartnerApiResponse,
} from '@/utils/server/verifiedSWCPartner/constants'
import { getOrCreateSessionIdToSendBackToPartner } from '@/utils/server/verifiedSWCPartner/getOrCreateSessionIdToSendBackToPartner'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import {
  Prisma,
  User,
  UserActionOptInType,
  UserActionType,
  UserEmailAddress,
  UserEmailAddressSource,
  UserSession,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'

export const zodVerifiedSWCPartnersUserActionOptIn = z.object({
  emailAddress: z.string().email().toLowerCase().trim(),
  optInType: z.nativeEnum(UserActionOptInType),
  campaignName: z.string(),
  isVerifiedEmailAddress: z.boolean(),
  fullName: z.string().trim().optional(),
  phoneNumber: zodPhoneNumber.optional().transform(str => str && normalizePhoneNumber(str)),
  hasOptedInToReceiveSMSFromSWC: z.boolean().optional(),
  hasOptedInToSms: z.boolean().optional(),
  hasOptedInToMembership: z.boolean().optional(),
})

const logger = getLogger('verifiedSWCPartnersUserActionOptIn')

export enum VerifiedSWCPartnersUserActionOptInResult {
  NEW_ACTION = 'new-action',
  EXISTING_ACTION = 'existing-action',
}

type UserWithRelations = User & {
  userEmailAddresses: UserEmailAddress[]
  userSessions: Array<UserSession>
}

type Input = z.infer<typeof zodVerifiedSWCPartnersUserActionOptIn> & {
  partner: VerifiedSWCPartner
}

export async function verifiedSWCPartnersUserActionOptIn(
  input: Input,
): Promise<VerifiedSWCPartnerApiResponse<VerifiedSWCPartnersUserActionOptInResult>> {
  const { emailAddress, optInType, isVerifiedEmailAddress, campaignName } = input
  const actionType = UserActionType.OPT_IN
  const existingAction = await prismaClient.userAction.findFirst({
    include: {
      user: {
        include: {
          userEmailAddresses: true,
          userSessions: true,
        },
      },
    },
    where: {
      actionType,
      userActionOptIn: {
        optInType,
      },
      user: {
        userEmailAddresses: {
          some: { emailAddress: emailAddress },
        },
      },
    },
  })
  const { user, userState } = await maybeUpsertUser({ existingUser: existingAction?.user, input })
  const localUser = getLocalUserFromUser(user)
  const analytics = getServerAnalytics({ userId: user.id, localUser })
  const peopleAnalytics = getServerPeopleAnalytics({ userId: user.id, localUser })
  if (!existingAction?.user) {
    peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }

  if (existingAction) {
    Sentry.captureMessage('verifiedSWCPartnersUserActionOptIn action already exists', {
      extra: { emailAddress, isVerifiedEmailAddress },
      tags: { optInType, actionType },
    })
    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      creationMethod: 'Verified SWC Partner',
      reason: 'Already Exists',
      userState,
    })
    return {
      result: VerifiedSWCPartnersUserActionOptInResult.EXISTING_ACTION,
      resultOptions: Object.values(VerifiedSWCPartnersUserActionOptInResult),
      sessionId: await getOrCreateSessionIdToSendBackToPartner(existingAction.user),
      userId: existingAction.user.id,
    }
  }
  const userAction = await prismaClient.userAction.create({
    include: {
      user: {
        include: {
          userSessions: true,
        },
      },
    },
    data: {
      actionType,
      campaignName: UserActionOptInCampaignName.DEFAULT,
      userActionOptIn: {
        create: {
          optInType,
        },
      },
      user: { connect: { id: user.id } },
    },
  })

  analytics.trackUserActionCreated({
    actionType,
    campaignName,
    creationMethod: 'Verified SWC Partner',
    userState,
  })

  // TODO send user to capital canary

  return {
    result: VerifiedSWCPartnersUserActionOptInResult.NEW_ACTION,
    resultOptions: Object.values(VerifiedSWCPartnersUserActionOptInResult),
    sessionId: await getOrCreateSessionIdToSendBackToPartner(userAction.user),
    userId: userAction.user.id,
  }
}

async function maybeUpsertUser({
  existingUser,
  input,
}: {
  existingUser: UserWithRelations | undefined
  input: Input
}): Promise<{ user: UserWithRelations; userState: AnalyticsUserActionUserState }> {
  const {
    emailAddress,
    isVerifiedEmailAddress,
    campaignName,
    partner,
    fullName,
    phoneNumber,
    hasOptedInToMembership,
    hasOptedInToSms,
  } = input

  if (existingUser) {
    const updatePayload: Prisma.UserUpdateInput = {
      ...(fullName && !existingUser.fullName && { fullName }),
      ...(phoneNumber && !existingUser.phoneNumber && { phoneNumber }),
      ...(!existingUser.hasOptedInToEmails && { hasOptedInToEmail: true }),
      ...(hasOptedInToMembership &&
        !existingUser.hasOptedInToMembership && { hasOptedInToMembership }),
      ...(hasOptedInToSms && !existingUser.hasOptedInToSms && { hasOptedInToSms }),
      ...(emailAddress &&
        existingUser.userEmailAddresses.every(addr => addr.emailAddress !== emailAddress) && {
          userEmailAddresses: {
            create: {
              emailAddress,
              isVerified: isVerifiedEmailAddress,
              source: UserEmailAddressSource.VERIFIED_THIRD_PARTY,
            },
          },
        }),
    }
    const keysToUpdate = Object.keys(updatePayload)
    if (!keysToUpdate.length) {
      return { user: existingUser, userState: 'Existing' }
    }
    logger.info(`updating the following user fields ${keysToUpdate.join(', ')}`)
    const user = await prismaClient.user.update({
      where: { id: existingUser.id },
      data: updatePayload,
      include: {
        userEmailAddresses: true,
        userSessions: true,
      },
    })
    const existingEmail = user.userEmailAddresses.find(email => email.emailAddress === emailAddress)
    if (existingEmail && !existingEmail.isVerified && isVerifiedEmailAddress) {
      logger.info(`verifying previously unverified email`)
      await prismaClient.userEmailAddress.update({
        where: { id: existingEmail.id },
        data: { isVerified: true },
      })
    }

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
  let user = await prismaClient.user.create({
    include: {
      userEmailAddresses: true,
      userSessions: true,
    },
    data: {
      ...getUserAttributionFieldsForVerifiedSWCPartner({ partner, campaignName }),
      userSessions: {
        create: {},
      },
      isPubliclyVisible: false,
      fullName: fullName,
      phoneNumber: phoneNumber,
      hasOptedInToEmails: true,
      hasOptedInToMembership: hasOptedInToMembership || false,
      hasOptedInToSms: hasOptedInToSms || false,
      userEmailAddresses: {
        create: {
          emailAddress,
          isVerified: isVerifiedEmailAddress,
          source: UserEmailAddressSource.VERIFIED_THIRD_PARTY,
        },
      },
    },
  })
  user = await prismaClient.user.update({
    include: {
      userEmailAddresses: true,
      userSessions: true,
    },
    where: { id: user.id },
    data: {
      primaryUserEmailAddressId: user.userEmailAddresses[0].id,
    },
  })
  return { user, userState: 'New' }
}
