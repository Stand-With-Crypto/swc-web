'use server'
import 'server-only'

import {
  Address,
  CapitolCanaryInstance,
  SMSStatus,
  User,
  UserCryptoAddress,
  UserEmailAddress,
  UserEmailAddressSource,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { z } from 'zod'

import { actionUpdateUserCountryCodeWithoutMiddleware } from '@/actions/actionUpdateUserCountryCode'
import { getSensitiveClientAddress } from '@/clientModels/clientAddress'
import { getClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { getENSDataFromCryptoAddressAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import * as smsActions from '@/utils/server/sms/actions'
import { logElectoralZoneNotFound } from '@/utils/server/swcCivic/utils/logElectoralZoneNotFound'
import { getEUCountryPrimaryLanguage, isEUCountry } from '@/utils/shared/euCountryMapping'
import {
  ElectoralZoneNotFoundReason,
  maybeGetElectoralZoneFromAddress,
} from '@/utils/shared/getElectoralZoneFromAddress'
import { getLogger } from '@/utils/shared/logger'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { userFullName } from '@/utils/shared/userFullName'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'
import { getZodUpdateUserProfileFormActionSchema } from '@/validation/forms/zodUpdateUserProfile/zodUpdateUserProfileFormAction'

export const actionUpdateUserProfile = withServerActionMiddleware(
  'actionUpdateUserProfile',
  actionUpdateUserProfileWithoutMiddleware,
)

const logger = getLogger(`actionUpdateUserProfile`)

type Input = z.infer<ReturnType<typeof getZodUpdateUserProfileFormActionSchema>>

async function actionUpdateUserProfileWithoutMiddleware(data: Input) {
  const authUser = await appRouterGetAuthUser()

  if (!authUser) {
    throw new Error('Unauthenticated')
  }
  // Assuming the country code is valid. If not, the default country code will be used.
  const validatedFields = getZodUpdateUserProfileFormActionSchema(
    data.address?.countryCode as SupportedCountryCodes,
  ).safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  if (validatedFields.data.address) {
    try {
      const electoralZone = await maybeGetElectoralZoneFromAddress({
        address: validatedFields.data.address,
      })
      if ('notFoundReason' in electoralZone || !electoralZone) {
        logElectoralZoneNotFound({
          address: validatedFields.data.address.formattedDescription,
          placeId: validatedFields.data.address.googlePlaceId,
          countryCode: validatedFields.data.address.countryCode,
          notFoundReason:
            electoralZone.notFoundReason ?? ElectoralZoneNotFoundReason.ELECTORAL_ZONE_NOT_FOUND,
          domain: 'actionUpdateUserProfile',
        })
      } else {
        validatedFields.data.address.electoralZone = electoralZone.zoneName
        if (electoralZone.administrativeArea) {
          validatedFields.data.address.swcCivicAdministrativeArea = electoralZone.administrativeArea
        }
      }
    } catch (error) {
      logger.error('error getting `electoralZone`:' + error)
      Sentry.captureException(error, {
        tags: {
          domain: 'actionUpdateUserProfile',
          message: 'error getting electoralZone',
        },
      })
    }
  }

  await throwIfRateLimited({ context: 'authenticated' })

  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
    include: {
      userEmailAddresses: true,
      primaryUserEmailAddress: true,
      address: true,
    },
  })
  const { firstName, lastName, emailAddress, phoneNumber, optedInToSms, hasOptedInToMembership } =
    validatedFields.data
  const address = validatedFields.data.address
    ? await prismaClient.address.upsert({
        where: {
          googlePlaceId: validatedFields.data.address.googlePlaceId,
        },
        create: validatedFields.data.address,
        update: validatedFields.data.address,
      })
    : null

  const { success: isSupportedCountryCode, data: addressCountryCode } =
    zodSupportedCountryCode.safeParse(address?.countryCode)
  if (address && isSupportedCountryCode && user.countryCode.toLowerCase() !== addressCountryCode) {
    await actionUpdateUserCountryCodeWithoutMiddleware(addressCountryCode)
  }

  const existingUserEmailAddress = emailAddress
    ? user.userEmailAddresses.find(addr => addr.emailAddress === emailAddress)
    : null
  const primaryUserEmailAddress =
    emailAddress && !existingUserEmailAddress
      ? await prismaClient.userEmailAddress.create({
          data: {
            emailAddress,
            source: UserEmailAddressSource.USER_ENTERED,
            isVerified: false,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        })
      : existingUserEmailAddress

  const localUser = await parseLocalUserFromCookies()

  // If the user removes their phone number and the current smsStatus is not OPTED_OUT we change the smsStatus to NOT_OPTED_IN
  const smsStatus =
    (!optedInToSms || !phoneNumber) && user.smsStatus !== SMSStatus.OPTED_OUT
      ? SMSStatus.NOT_OPTED_IN
      : user.smsStatus

  waitUntil(
    getServerPeopleAnalytics({
      userId: authUser.userId,
      localUser,
    })
      .set({
        ...(address ? convertAddressToAnalyticsProperties(address) : {}),
        // https://docs.mixpanel.com/docs/data-structure/user-profiles#reserved-user-properties
        $email: emailAddress,
        $phone: phoneNumber,
        $name: userFullName(validatedFields.data),
        'Has Opted In To Membership': hasOptedInToMembership,
        'SMS Status': smsStatus,
        'Has Opted In To Sms': optedInToSms,
      })
      .flush(),
  )

  const newLanguage =
    address && isEUCountry(address.countryCode)
      ? getEUCountryPrimaryLanguage(address.countryCode)
      : undefined

  const updatedUser = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      firstName,
      lastName,
      ...(newLanguage !== user.language && { language: newLanguage }),
      phoneNumber,
      hasOptedInToMembership,
      hasValidPhoneNumber: true,
      addressId: address?.id || null,
      primaryUserEmailAddressId: primaryUserEmailAddress?.id || null,
      smsStatus,
    },
    include: {
      address: true,
      primaryUserCryptoAddress: true,
    },
  })

  if (optedInToSms && phoneNumber) {
    updatedUser.smsStatus = await smsActions.optInUser({
      phoneNumber,
      user,
      countryCode:
        addressCountryCode ??
        (user.countryCode as SupportedCountryCodes) ??
        DEFAULT_SUPPORTED_COUNTRY_CODE,
    })
  }

  await handleCapitolCanaryAdvocateUpsert(updatedUser, primaryUserEmailAddress, user)

  return {
    user: {
      ...getClientUserWithENSData(
        updatedUser,
        updatedUser.primaryUserCryptoAddress
          ? await getENSDataFromCryptoAddressAndFailGracefully(
              updatedUser.primaryUserCryptoAddress.cryptoAddress,
            )
          : null,
      ),
      address: updatedUser.address && getSensitiveClientAddress(updatedUser.address),
    },
  }
}

async function handleCapitolCanaryAdvocateUpsert(
  updatedUser: User & { address: Address | null } & {
    primaryUserCryptoAddress: UserCryptoAddress | null
  },
  primaryUserEmailAddress: UserEmailAddress | null | undefined,
  oldUser: User & { address: Address | null } & {
    primaryUserEmailAddress: UserEmailAddress | null
  } & { userEmailAddresses: UserEmailAddress[] },
) {
  // Send unsubscribe payload if the old email address or phone number has changed, or if the user removed their old email or phone number.
  // `hasChangedEmail` is true if an old email address exists and the new email address is different from the old email address.
  const hasChangedEmail =
    !!oldUser.primaryUserEmailAddress &&
    (!primaryUserEmailAddress ||
      oldUser.primaryUserEmailAddress.emailAddress !== primaryUserEmailAddress.emailAddress)
  if (hasChangedEmail) {
    await inngest.send({
      name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
      data: {
        campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER),
        user: {
          ...updatedUser, // Use new user information EXCEPT for the phone number.
          address: updatedUser.address,
        },
        userEmailAddress: oldUser.primaryUserEmailAddress, // Using old email here.
        opts: {
          isEmailOptout: hasChangedEmail,
        },
      },
    })
  }

  // Only send updating payload if we do not have an SwC advocate ID
  // or there has been a changed field (name, address, email address, phone number, opt-ins/outs, and joining C4 Member),
  // and we at least have email or phone number.
  // Breaking early if nothing has been changed.
  if (
    (!updatedUser.capitolCanaryAdvocateId ||
      updatedUser.capitolCanaryInstance === CapitolCanaryInstance.LEGACY ||
      oldUser.firstName !== updatedUser.firstName ||
      oldUser.lastName !== updatedUser.lastName ||
      oldUser.address?.googlePlaceId !== updatedUser.address?.googlePlaceId ||
      oldUser.primaryUserEmailAddress?.emailAddress !== primaryUserEmailAddress?.emailAddress ||
      oldUser.phoneNumber !== updatedUser.phoneNumber ||
      oldUser.smsStatus !== updatedUser.smsStatus ||
      (!oldUser.hasOptedInToMembership && updatedUser.hasOptedInToMembership)) &&
    (primaryUserEmailAddress || updatedUser.phoneNumber)
  ) {
    await inngest.send({
      name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
      data: {
        campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER),
        user: {
          ...updatedUser, // Using new user information (including new phone number).
          address: updatedUser.address,
        },
        userEmailAddress: primaryUserEmailAddress, // Using new email here.
        opts: {
          isEmailOptin: true,
          isSmsOptin: updatedUser.smsStatus === SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN,
        },
        ...(!oldUser.hasOptedInToMembership &&
          updatedUser.hasOptedInToMembership && {
            metadata: {
              tags: ['C4 Member'],
            },
          }),
      },
    })
  }
}
