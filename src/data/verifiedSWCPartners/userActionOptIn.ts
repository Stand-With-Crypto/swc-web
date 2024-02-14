import {
  Address,
  Prisma,
  User,
  UserActionOptInType,
  UserActionType,
  UserEmailAddress,
  UserEmailAddressSource,
  UserInformationVisibility,
  UserSession,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'

import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
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
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'

export const zodVerifiedSWCPartnersUserActionOptIn = z.object({
  emailAddress: z.string().email().toLowerCase().trim(),
  optInType: z.nativeEnum(UserActionOptInType),
  campaignName: z.string(),
  isVerifiedEmailAddress: z.boolean(),
  firstName: zodFirstName.optional(),
  lastName: zodLastName.optional(),
  phoneNumber: zodPhoneNumber.optional().transform(str => str && normalizePhoneNumber(str)),
  hasOptedInToReceiveSMSFromSWC: z.boolean().optional(),
  hasOptedInToEmails: z.boolean().optional(),
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
  address?: Address | null
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

  // TODO (Benson): Handle CC membership toggling options: https://github.com/Stand-With-Crypto/swc-web/issues/173
  // TODO (Benson): Include p2a source in Capitol Canary payload to know which 3P is sending this request.
  const payload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
    campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER),
    user: {
      ...user,
      address: user.address || null,
    },
    userEmailAddress: user.userEmailAddresses.find(
      emailAddr => emailAddr.id === user.primaryUserEmailAddressId,
    ),
    opts: {
      isEmailOptin: true,
      isSmsOptin: input.hasOptedInToReceiveSMSFromSWC,
      shouldSendSmsOptinConfirmation: false,
    },
  }
  await inngest.send({
    name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
    data: payload,
  })

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
    firstName,
    lastName,
    phoneNumber,
    hasOptedInToMembership,
    hasOptedInToReceiveSMSFromSWC,
  } = input

  if (existingUser) {
    const updatePayload: Prisma.UserUpdateInput = {
      // TODO typesafe against invalid fields
      ...(firstName && !existingUser.firstName && { firstName }),
      ...(lastName && !existingUser.lastName && { lastName }),
      ...(phoneNumber && !existingUser.phoneNumber && { phoneNumber }),
      ...(!existingUser.hasOptedInToEmails && { hasOptedInToEmails: true }),
      ...(hasOptedInToMembership &&
        !existingUser.hasOptedInToMembership && { hasOptedInToMembership }),
      ...(hasOptedInToReceiveSMSFromSWC &&
        !existingUser.hasOptedInToSms && { hasOptedInToReceiveSMSFromSWC }),
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
        address: true,
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
      address: true,
    },
    data: {
      ...getUserAttributionFieldsForVerifiedSWCPartner({ partner, campaignName }),
      userSessions: {
        create: {},
      },
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      firstName,
      lastName,
      phoneNumber,
      hasOptedInToEmails: true,
      hasOptedInToMembership: hasOptedInToMembership || false,
      hasOptedInToSms: hasOptedInToReceiveSMSFromSWC || false,
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
      address: true,
    },
    where: { id: user.id },
    data: {
      primaryUserEmailAddressId: user.userEmailAddresses[0].id,
    },
  })
  return { user, userState: 'New' }
}
