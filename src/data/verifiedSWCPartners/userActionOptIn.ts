import { prismaClient } from '@/utils/server/prismaClient'
import { Prisma, UserActionOptInType, UserActionType } from '@prisma/client'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { getLogger } from '@/utils/shared/logger'
import { getOrCreateSessionIdToSendBackToPartner } from '@/utils/server/verifiedSWCPartner/getOrCreateSessionIdToSendBackToPartner'
import { getUserAttributionFieldsForVerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/attribution'
import {
  VerifiedSWCPartner,
  VerifiedSWCPartnerApiResponse,
} from '@/utils/server/verifiedSWCPartner/constants'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { maybeUpsertUser } from '@/utils/server/maybeUpsertUser'

export const zodVerifiedSWCPartnersUserActionOptIn = z.object({
  emailAddress: z.string().email().toLowerCase().trim(),
  optInType: z.nativeEnum(UserActionOptInType),
  campaignName: z.string(),
  isVerifiedEmailAddress: z.boolean(),
  fullName: z.string().trim().optional(),
  phoneNumber: zodPhoneNumber.optional().transform(str => str && normalizePhoneNumber(str)),
  hasOptedInToSms: z.boolean().optional(),
  hasOptedInToMembership: z.boolean().optional(),
})

const logger = getLogger('verifiedSWCPartnersUserActionOptIn')

export enum VerifiedSWCPartnersUserActionOptInResult {
  NEW_ACTION = 'new-action',
  EXISTING_ACTION = 'existing-action',
}

export async function verifiedSWCPartnersUserActionOptIn({
  emailAddress,
  optInType,
  isVerifiedEmailAddress,
  campaignName,
  partner,
  fullName,
  phoneNumber,
  hasOptedInToSms,
  hasOptedInToMembership,
}: z.infer<typeof zodVerifiedSWCPartnersUserActionOptIn> & {
  partner: VerifiedSWCPartner
}): Promise<VerifiedSWCPartnerApiResponse<VerifiedSWCPartnersUserActionOptInResult>> {
  // TODO decide if we need to create two actions based off whether hasOptedInToMembership has been passed
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
          some: { emailAddress: emailAddress, isVerified: true },
        },
      },
    },
  })
  const existingUser = existingAction?.user
  const { user, upsertUserResult } = await maybeUpsertUser({
    userArgs: existingUser
      ? {
          user: existingUser,
          updateFields: {
            ...(fullName && !existingUser.fullName && { fullName }),
            ...(phoneNumber && !existingUser.phoneNumber && { phoneNumber }),
            ...(!existingUser.hasOptedInToEmails && { hasOptedInToEmail: true }),
            ...(hasOptedInToMembership &&
              !existingUser.hasOptedInToMembership && { hasOptedInToMembership }),
            ...(hasOptedInToSms && !existingUser.hasOptedInToSms && { hasOptedInToSms }),
          },
        }
      : {
          createFields: {
            ...getUserAttributionFieldsForVerifiedSWCPartner({ partner, campaignName }),
            userSessions: {
              create: {},
            },
            hasOptedInToEmails: true,
            hasOptedInToMembership: hasOptedInToMembership || false,
            hasOptedInToSms: hasOptedInToSms || false,
            isPubliclyVisible: false,
            fullName: fullName,
            phoneNumber: phoneNumber,
          },
        },
    selectArgs: {
      include: {
        userEmailAddresses: true,
        userSessions: true,
      },
    },
  })
  const sessionId = await getOrCreateSessionIdToSendBackToPartner(user)
  const localUser = getLocalUserFromUser(user)
  const analytics = getServerAnalytics({ sessionId, localUser })
  const peopleAnalytics = getServerPeopleAnalytics({ sessionId, localUser })
  if (!existingAction?.user) {
    peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }
  const existingEmail = user.userEmailAddresses.find(email => email.emailAddress === emailAddress)
  if (existingEmail && !existingEmail.isVerified && isVerifiedEmailAddress) {
    logger.info(`verifying previously unverified email`)
    analytics.track('Email Verified', { creationMethod: 'Verified SWC Partner' })
    await prismaClient.userEmailAddress.update({
      where: { id: existingEmail.id },
      data: { isVerified: true },
    })
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
      userState: upsertUserResult,
    })
    return {
      result: VerifiedSWCPartnersUserActionOptInResult.EXISTING_ACTION,
      resultOptions: Object.values(VerifiedSWCPartnersUserActionOptInResult),
      sessionId: await getOrCreateSessionIdToSendBackToPartner(existingAction.user),
      userId: existingAction.user.id,
    }
  }
  await prismaClient.userAction.create({
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
    userState: upsertUserResult,
  })

  // TODO send user to capital canary

  return {
    result: VerifiedSWCPartnersUserActionOptInResult.NEW_ACTION,
    resultOptions: Object.values(VerifiedSWCPartnersUserActionOptInResult),
    sessionId: await getOrCreateSessionIdToSendBackToPartner(user),
    userId: user.id,
  }
}
