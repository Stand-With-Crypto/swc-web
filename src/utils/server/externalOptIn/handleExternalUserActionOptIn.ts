'use server'
import 'server-only'

import {
  Prisma,
  SMSStatus,
  SupportedUserCryptoNetwork,
  User,
  UserActionType,
  UserEmailAddressSource,
  UserInformationVisibility,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { after } from 'next/server'
import { z } from 'zod'

import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { UpsertAdvocateInCapitolCanaryPayloadRequirements } from '@/utils/server/capitolCanary/payloadRequirements'
import { getOrCreateSessionIdForUser } from '@/utils/server/externalOptIn/getOrCreateSessionIdForUser'
import {
  ExternalUserActionOptInResponse,
  ExternalUserActionOptInResult,
  Input,
  UserWithRelations,
} from '@/utils/server/externalOptIn/types'
import { getAddressFromGooglePlacePrediction } from '@/utils/server/getAddressFromGooglePlacePrediction'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  AnalyticsUserActionUserState,
  getServerAnalytics,
  getServerPeopleAnalytics,
} from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import * as smsActions from '@/utils/server/sms/actions'
import { logElectoralZoneNotFound } from '@/utils/server/swcCivic/utils/logElectoralZoneNotFound'
import { getUserAcquisitionFieldsForVerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/attribution'
import { VerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/constants'
import { getFormattedDescription } from '@/utils/shared/address'
import {
  ElectoralZoneNotFoundReason,
  maybeGetElectoralZoneFromAddress,
} from '@/utils/shared/getElectoralZoneFromAddress'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { COUNTRY_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns'
import { userFullName } from '@/utils/shared/userFullName'
import { zodAddress } from '@/validation/fields/zodAddress'

const logger = getLogger('handleExternalUserActionOptIn')

const actionType = UserActionType.OPT_IN
const campaignId = getCapitolCanaryCampaignID(CapitolCanaryCampaignName.ONE_CLICK_NATIVE_SUBSCRIBER)

export async function handleExternalUserActionOptIn(
  input: Input,
): Promise<ExternalUserActionOptInResponse<ExternalUserActionOptInResult>> {
  const { emailAddress, cryptoAddress, optInType, campaignName, countryCode } = input

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

  const { user, userState } = await maybeUpsertUser({
    input,
    existingUser: existingAction?.user,
    countryCode: countryCode?.toLowerCase(),
  })
  const localUser = getLocalUserFromUser(user)
  const analytics = getServerAnalytics({ userId: user.id, localUser })
  const peopleAnalytics = getServerPeopleAnalytics({ userId: user.id, localUser })
  const flushAnalytics = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  if (!existingAction?.user) {
    peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }

  const capitolCanaryPayload: UpsertAdvocateInCapitolCanaryPayloadRequirements = {
    campaignId,
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

  if (input.hasOptedInToReceiveSMSFromSWC && input.phoneNumber && input.hasValidPhoneNumber) {
    const optInUserPayload = { phoneNumber: input.phoneNumber, user, countryCode }

    after(async () => {
      await smsActions.optInUser(optInUserPayload)
    })
  }

  if (existingAction) {
    if (
      existingAction.user.smsStatus === SMSStatus.NOT_OPTED_IN &&
      input.hasOptedInToReceiveSMSFromSWC
    ) {
      after(async () => {
        await inngest.send({
          name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
          data: capitolCanaryPayload,
        })
      })
    }

    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      creationMethod: input.partner ? 'Verified SWC Partner' : 'Third Party',
      reason: 'Already Exists',
      userState,
      ...input.additionalAnalyticsProperties,
      countryCode,
    })

    after(async () => await flushAnalytics())

    return {
      result: ExternalUserActionOptInResult.EXISTING_ACTION,
      resultOptions: Object.values(ExternalUserActionOptInResult),
      sessionId: await getOrCreateSessionIdForUser(existingAction.user),
      userId: existingAction.user.id,
    }
  }

  const userActionCampaignName =
    COUNTRY_USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[countryCode].OPT_IN

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
      campaignName: userActionCampaignName,
      userActionOptIn: {
        create: {
          optInType,
        },
      },
      countryCode: user.countryCode,
      user: { connect: { id: user.id } },
    },
  })

  const addressAnalyticsProperties = input.address
    ? convertAddressToAnalyticsProperties(input.address)
    : {}

  analytics.trackUserActionCreated({
    actionType,
    campaignName,
    creationMethod: input.partner ? 'Verified SWC Partner' : 'Third Party',
    userState,
    ...input.additionalAnalyticsProperties,
    ...addressAnalyticsProperties,
    countryCode,
  })
  peopleAnalytics.set({
    ...addressAnalyticsProperties,
    // https://docs.mixpanel.com/docs/data-structure/user-profiles#reserved-user-properties
    $email: input.emailAddress,
    $name: userFullName(input),
  })

  // TODO (Benson): Include p2a source in Capitol Canary payload to know which 3P is sending this request.
  if (!capitolCanaryPayload.opts) {
    capitolCanaryPayload.opts = {}
  }
  capitolCanaryPayload.opts.isEmailOptin = true
  after(async () => {
    await inngest.send({
      name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
      data: capitolCanaryPayload,
    })
  })

  after(async () => await flushAnalytics())
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
  countryCode,
}: {
  existingUser: UserWithRelations | undefined
  input: Input
  countryCode: string
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
    address,
    hasValidPhoneNumber,
  } = input

  let dbAddress: z.infer<typeof zodAddress> | undefined = undefined
  if (address) {
    const formattedDescription = getFormattedDescription(address, true)
    dbAddress = {
      ...address,
      formattedDescription: formattedDescription,
      googlePlaceId: undefined,
      latitude: null,
      longitude: null,
    }
    try {
      const googleAddressData = await getAddressFromGooglePlacePrediction({
        description: formattedDescription,
      })
      // Filter out fields without data to avoid overwriting existing data from the external source
      const filteredGoogleAddressData = Object.fromEntries(
        Object.entries(googleAddressData).filter(([_, value]) => Boolean(value)),
      )
      dbAddress = {
        ...dbAddress,
        ...filteredGoogleAddressData,
      }
    } catch (e) {
      logger.error('error getting `googlePlaceId`:' + e)
    }

    try {
      const electoralZone = await maybeGetElectoralZoneFromAddress({
        address: {
          ...dbAddress,
          googlePlaceId: dbAddress?.googlePlaceId || null,
          latitude: dbAddress?.latitude || null,
          longitude: dbAddress?.longitude || null,
        },
      })

      if ('notFoundReason' in electoralZone || !electoralZone) {
        logElectoralZoneNotFound({
          address: dbAddress.formattedDescription,
          notFoundReason:
            electoralZone.notFoundReason || ElectoralZoneNotFoundReason.ELECTORAL_ZONE_NOT_FOUND,
          domain: 'handleExternalUserActionOptIn - maybeUpsertUser',
        })
      } else {
        dbAddress.electoralZone = electoralZone.zoneName
        if (electoralZone.administrativeArea) {
          dbAddress.swcCivicAdministrativeArea = electoralZone.administrativeArea
        }
      }
    } catch (error) {
      logger.error('error getting `electoralZone`:' + error)
      Sentry.captureException(error, {
        fingerprint: ['error getting electoralZone'],
        tags: {
          domain: 'handleExternalUserActionOptIn - maybeUpsertUser',
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
      ...(hasValidPhoneNumber !== existingUser.hasValidPhoneNumber && { hasValidPhoneNumber }),
      ...(!existingUser.hasOptedInToEmails && { hasOptedInToEmails: true }),
      ...(hasOptedInToMembership &&
        !existingUser.hasOptedInToMembership && { hasOptedInToMembership }),
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

    let possiblePrimaryEmailAndCryptoPayload: Prisma.UserUpdateInput = {}

    if (!user.primaryUserEmailAddressId && emailAddress) {
      const newEmail = user.userEmailAddresses.find(addr => addr.emailAddress === emailAddress)!
      logger.info(`updating primary email`)

      possiblePrimaryEmailAndCryptoPayload = {
        primaryUserEmailAddress: {
          connect: { id: newEmail.id },
        },
      }

      user.primaryUserEmailAddressId = newEmail.id
    }

    if (!user.primaryUserCryptoAddressId && cryptoAddress) {
      const newCryptoAddress = user.userCryptoAddresses.find(
        addr => addr.cryptoAddress === cryptoAddress,
      )!
      logger.info(`updating primary crypto address`)

      possiblePrimaryEmailAndCryptoPayload = {
        primaryUserCryptoAddress: {
          connect: { id: newCryptoAddress.id },
        },
      }

      user.primaryUserCryptoAddressId = newCryptoAddress.id
    }

    await prismaClient.user.update({
      where: { id: user.id },
      data: possiblePrimaryEmailAndCryptoPayload,
    })

    return { user, userState: 'Existing With Updates' }
  }

  const user = await prismaClient.user.create({
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
      hasValidPhoneNumber,
      hasOptedInToEmails: true,
      hasOptedInToMembership: hasOptedInToMembership || false,
      countryCode,
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

  const updatedUser = await prismaClient.user.update({
    include: {
      userEmailAddresses: true,
    },
    where: { id: user.id },
    data: {
      primaryUserEmailAddressId: user.userEmailAddresses[0].id,
    },
  })

  return { user: { ...user, ...updatedUser }, userState: 'New' }
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
