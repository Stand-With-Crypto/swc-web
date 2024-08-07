import {
  Address,
  Prisma,
  SupportedUserCryptoNetwork,
  User,
  UserActionOptInType,
  UserActionType,
  UserCryptoAddress,
  UserEmailAddress,
  UserEmailAddressSource,
  UserInformationVisibility,
  UserSession,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { isAddress } from 'viem'
import { object, string, z } from 'zod'

import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { getOrCreateSessionIdForUser } from '@/utils/server/externalOptIn/getOrCreateSessionIdForUser'
import { getGooglePlaceIdFromAddress } from '@/utils/server/getGooglePlaceIdFromAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  AnalyticsUserActionUserState,
  getServerAnalytics,
  getServerPeopleAnalytics,
} from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { getUserAcquisitionFieldsForVerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/attribution'
import { VerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/constants'
import { getFormattedDescription } from '@/utils/shared/address'
import { maybeGetCongressionalDistrictFromAddress } from '@/utils/shared/getCongressionalDistrictFromAddress'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodOptionalEmptyPhoneNumber } from '@/validation/fields/zodPhoneNumber'

export const zodExternalUserActionOptInUserAddress = object({
  streetNumber: string(),
  route: string(),
  subpremise: string(),
  locality: string(),
  administrativeAreaLevel1: string(),
  administrativeAreaLevel2: string(),
  postalCode: string(),
  postalCodeSuffix: string(),
  countryCode: string().length(2),
})

export const zodExternalUserActionOptIn = z.object({
  emailAddress: zodEmailAddress,
  cryptoAddress: string()
    .optional()
    .refine(str => !str || isAddress(str), { message: 'Invalid Ethereum address' })
    .transform(str => str && str.toLowerCase()),
  optInType: z.nativeEnum(UserActionOptInType),
  campaignName: z.string(),
  isVerifiedEmailAddress: z.boolean(),
  firstName: zodFirstName.optional(),
  lastName: zodLastName.optional(),
  address: zodExternalUserActionOptInUserAddress.optional(),
  phoneNumber: zodOptionalEmptyPhoneNumber,
  hasOptedInToReceiveSMSFromSWC: z.boolean().optional(),
  hasOptedInToEmails: z.boolean().optional(),
  hasOptedInToMembership: z.boolean().optional(),
  acquisitionOverride: z
    .object({
      source: z.string(),
      medium: z.string(),
    })
    .optional(),
  additionalAnalyticsProperties: z.record(z.string()).optional(),
})

const logger = getLogger('handleExternalUserActionOptIn')

export enum ExternalUserActionOptInResult {
  NEW_ACTION = 'new-action',
  EXISTING_ACTION = 'existing-action',
}

type UserWithRelations = User & {
  userEmailAddresses: UserEmailAddress[]
  userCryptoAddresses: UserCryptoAddress[]
  userSessions: Array<UserSession>
  address?: Address | null
}

type Input = z.infer<typeof zodExternalUserActionOptIn> & {
  partner?: VerifiedSWCPartner
}

export type ExternalUserActionOptInResponse<ResultOptions extends string> = {
  result: ResultOptions
  resultOptions: ResultOptions[]
  sessionId: string
  userId: string
}

export async function handleExternalUserActionOptIn(
  input: Input,
): Promise<ExternalUserActionOptInResponse<ExternalUserActionOptInResult>> {
  const { emailAddress, cryptoAddress, optInType, campaignName } = input
  const actionType = UserActionType.OPT_IN
  const existingAction = await prismaClient.userAction.findFirst({
    include: {
      user: {
        include: {
          userEmailAddresses: true,
          userCryptoAddresses: true,
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
        OR: [
          {
            userEmailAddresses: {
              some: { emailAddress: emailAddress },
            },
          },
          cryptoAddress
            ? {
                userCryptoAddresses: {
                  some: {
                    cryptoAddress: cryptoAddress,
                    cryptoNetwork: SupportedUserCryptoNetwork.ETH,
                  },
                },
              }
            : {},
        ],
      },
    },
  })
  const { user, userState } = await maybeUpsertUser({ existingUser: existingAction?.user, input })
  const localUser = getLocalUserFromUser(user)
  const analytics = getServerAnalytics({ userId: user.id, localUser })
  if (!existingAction?.user) {
    waitUntil(
      getServerPeopleAnalytics({ userId: user.id, localUser })
        .setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
        .flush(),
    )
  }

  const capitolCanaryPayload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
    campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.ONE_CLICK_NATIVE_SUBSCRIBER),
    user: {
      ...user,
      address: user.address || null,
    },
    userEmailAddress: user.userEmailAddresses.find(
      emailAddr => emailAddr.id === user.primaryUserEmailAddressId,
    ),
    opts: {
      isSmsOptin: input.hasOptedInToReceiveSMSFromSWC,
      shouldSendSmsOptinConfirmation: false,
    },
  }

  if (existingAction) {
    if (!existingAction.user.hasOptedInToSms && input.hasOptedInToReceiveSMSFromSWC) {
      await prismaClient.user.update({
        where: { id: existingAction.user.id },
        data: { hasOptedInToSms: true },
      })
      await inngest.send({
        name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
        data: capitolCanaryPayload,
      })
    }
    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      creationMethod: input.partner ? 'Verified SWC Partner' : 'Third Party',
      reason: 'Already Exists',
      userState,
      ...input.additionalAnalyticsProperties,
    })
    waitUntil(analytics.flush())
    return {
      result: ExternalUserActionOptInResult.EXISTING_ACTION,
      resultOptions: Object.values(ExternalUserActionOptInResult),
      sessionId: await getOrCreateSessionIdForUser(existingAction.user),
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
    creationMethod: input.partner ? 'Verified SWC Partner' : 'Third Party',
    userState,
    ...input.additionalAnalyticsProperties,
  })

  // TODO (Benson): Include p2a source in Capitol Canary payload to know which 3P is sending this request.
  if (!capitolCanaryPayload.opts) {
    capitolCanaryPayload.opts = {}
  }
  capitolCanaryPayload.opts.isEmailOptin = true
  await inngest.send({
    name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
    data: capitolCanaryPayload,
  })

  waitUntil(analytics.flush())
  return {
    result: ExternalUserActionOptInResult.NEW_ACTION,
    resultOptions: Object.values(ExternalUserActionOptInResult),
    sessionId: await getOrCreateSessionIdForUser(userAction.user),
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
    cryptoAddress,
    isVerifiedEmailAddress,
    campaignName,
    partner,
    firstName,
    lastName,
    phoneNumber,
    hasOptedInToMembership,
    hasOptedInToReceiveSMSFromSWC,
    address,
  } = input

  let dbAddress: z.infer<typeof zodAddress> | undefined = undefined
  if (address) {
    const formattedDescription = getFormattedDescription(address, true)
    dbAddress = { ...address, formattedDescription: formattedDescription, googlePlaceId: undefined }
    try {
      dbAddress.googlePlaceId = await getGooglePlaceIdFromAddress(
        getFormattedDescription(address, false),
      )
    } catch (e) {
      logger.error('error getting `googlePlaceId`:' + e)
    }

    try {
      const usCongressionalDistrict = await maybeGetCongressionalDistrictFromAddress(dbAddress)

      if ('notFoundReason' in usCongressionalDistrict) {
        logger.error(
          `No usCongressionalDistrict found for address ${dbAddress.formattedDescription} with code ${usCongressionalDistrict.notFoundReason}`,
        )
        if (
          ['CIVIC_API_DOWN', 'UNEXPECTED_ERROR'].includes(usCongressionalDistrict.notFoundReason)
        ) {
          Sentry.captureMessage(
            `No usCongressionalDistrict found for address ${dbAddress.formattedDescription}`,
            {
              extra: {
                domain: 'handleExternalUserActionOptIn - maybeUpsertUser',
                notFoundReason: usCongressionalDistrict.notFoundReason,
              },
            },
          )
        }
      }
      if ('districtNumber' in usCongressionalDistrict) {
        dbAddress.usCongressionalDistrict = `${usCongressionalDistrict.districtNumber}`
      }
    } catch (error) {
      logger.error('error getting `usCongressionalDistrict`:' + error)
      Sentry.captureException(error, {
        tags: {
          domain: 'handleExternalUserActionOptIn - maybeUpsertUser',
          message: 'error getting usCongressionalDistrict',
        },
      })
    }
  }

  const emailSource = partner
    ? UserEmailAddressSource.VERIFIED_THIRD_PARTY
    : UserEmailAddressSource.USER_ENTERED

  if (existingUser) {
    const updatePayload: Prisma.UserUpdateInput = {
      ...(firstName && !existingUser.firstName && { firstName }),
      ...(lastName && !existingUser.lastName && { lastName }),
      ...(phoneNumber && !existingUser.phoneNumber && { phoneNumber }),
      ...(!existingUser.hasOptedInToEmails && { hasOptedInToEmails: true }),
      ...(hasOptedInToMembership &&
        !existingUser.hasOptedInToMembership && { hasOptedInToMembership }),
      ...(hasOptedInToReceiveSMSFromSWC &&
        !existingUser.hasOptedInToSms && { hasOptedInToSms: hasOptedInToReceiveSMSFromSWC }),
      ...(emailAddress &&
        existingUser.userEmailAddresses.every(addr => addr.emailAddress !== emailAddress) && {
          userEmailAddresses: {
            create: {
              emailAddress,
              isVerified: isVerifiedEmailAddress,
              source: emailSource,
            },
          },
        }),
      ...(cryptoAddress &&
        existingUser.userCryptoAddresses.every(addr => addr.cryptoAddress !== cryptoAddress) && {
          userCryptoAddresses: {
            create: {
              cryptoAddress,
              cryptoNetwork: SupportedUserCryptoNetwork.ETH,
              hasBeenVerifiedViaAuth: false,
            },
          },
        }),
      ...(dbAddress && {
        address: {
          ...(dbAddress.googlePlaceId
            ? {
                connectOrCreate: {
                  where: { googlePlaceId: dbAddress.googlePlaceId },
                  create: dbAddress,
                },
              }
            : {
                create: dbAddress,
              }),
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
        userCryptoAddresses: true,
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

    if (!user.primaryUserCryptoAddressId && cryptoAddress) {
      const newCryptoAddress = user.userCryptoAddresses.find(
        addr => addr.cryptoAddress === cryptoAddress,
      )!
      logger.info(`updating primary crypto address`)
      await prismaClient.user.update({
        where: { id: user.id },
        data: { primaryUserCryptoAddressId: newCryptoAddress.id },
      })
      user.primaryUserCryptoAddressId = newCryptoAddress.id
    }

    return { user, userState: 'Existing With Updates' }
  }

  let user = await prismaClient.user.create({
    include: {
      userEmailAddresses: true,
      userCryptoAddresses: true,
      userSessions: true,
      address: true,
    },
    data: {
      ...getUserAcquisitionFields({
        partner,
        campaignName,
        acquisitionOverride: input.acquisitionOverride,
      }),
      referralId: generateReferralId(),
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
      hasRepliedToOptInSms: false,
      userEmailAddresses: {
        create: {
          emailAddress,
          isVerified: isVerifiedEmailAddress,
          source: emailSource,
        },
      },
      ...(cryptoAddress && {
        userCryptoAddresses: {
          create: {
            cryptoAddress,
            cryptoNetwork: SupportedUserCryptoNetwork.ETH,
            hasBeenVerifiedViaAuth: false,
          },
        },
      }),
      ...(dbAddress && {
        address: {
          ...(dbAddress.googlePlaceId
            ? {
                connectOrCreate: {
                  where: { googlePlaceId: dbAddress.googlePlaceId },
                  create: dbAddress,
                },
              }
            : {
                create: dbAddress,
              }),
        },
      }),
    },
  })
  user = await prismaClient.user.update({
    include: {
      userEmailAddresses: true,
      userCryptoAddresses: true,
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

function getUserAcquisitionFields({
  partner,
  campaignName,
  acquisitionOverride,
}: {
  partner?: VerifiedSWCPartner
  campaignName: string
  acquisitionOverride?: {
    source: string
    medium: string
  }
}): Pick<
  User,
  'acquisitionReferer' | 'acquisitionSource' | 'acquisitionMedium' | 'acquisitionCampaign'
> {
  if (partner) {
    return getUserAcquisitionFieldsForVerifiedSWCPartner({ partner, campaignName })
  }
  return {
    acquisitionReferer: '',
    acquisitionSource: acquisitionOverride?.source || '',
    acquisitionMedium: acquisitionOverride?.medium || '',
    acquisitionCampaign: campaignName,
  }
}
