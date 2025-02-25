'use server'
import 'server-only'

import {
  Address,
  Prisma,
  SMSStatus,
  User,
  UserActionType,
  UserCryptoAddress,
  UserEmailAddress,
  UserEmailAddressSource,
  UserInformationVisibility,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/emailViaCapitolCanary'
import { inngest } from '@/inngest/inngest'
import {
  CapitolCanaryCampaignId,
  SandboxCapitolCanaryCampaignId,
} from '@/utils/server/capitolCanary/campaigns'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { getTenantId } from '@/utils/server/getTenantId'
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
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import {
  logCongressionalDistrictNotFound,
  maybeGetCongressionalDistrictFromAddress,
} from '@/utils/shared/getCongressionalDistrictFromAddress'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { userFullName } from '@/utils/shared/userFullName'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory'
import { withSafeParseWithMetadata } from '@/utils/shared/zod'
import { zodUserActionFormEmailCongresspersonAction } from '@/validation/forms/zodUserActionFormEmailCongressperson'

const logger = getLogger(`actionCreateUserActionEmailCongressperson`)

type UserWithRelations = User & {
  primaryUserCryptoAddress: UserCryptoAddress | null
  userEmailAddresses: UserEmailAddress[]
  address: Address | null
}
type Input = z.infer<typeof zodUserActionFormEmailCongresspersonAction>

export const actionCreateUserActionEmailCongressperson = withServerActionMiddleware(
  'actionCreateUserActionEmailCongressperson',
  withValidations(
    [createCountryCodeValidation(DEFAULT_SUPPORTED_COUNTRY_CODE)],
    _actionCreateUserActionEmailCongressperson,
  ),
)

async function _actionCreateUserActionEmailCongressperson(input: Input) {
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
  const sessionId = await getUserSessionId()
  const validatedFields = withSafeParseWithMetadata(
    zodUserActionFormEmailCongresspersonAction,
    input,
  )
  const tenantId = await getTenantId()

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      errorsMetadata: validatedFields.errorsMetadata,
    }
  }
  logger.info('validated fields')

  try {
    const usCongressionalDistrict = await maybeGetCongressionalDistrictFromAddress(
      validatedFields.data.address,
    )
    if ('notFoundReason' in usCongressionalDistrict) {
      logCongressionalDistrictNotFound({
        address: validatedFields.data.address.formattedDescription,
        notFoundReason: usCongressionalDistrict.notFoundReason,
        domain: 'actionCreateUserActionEmailCongressperson',
      })
    }
    if ('districtNumber' in usCongressionalDistrict) {
      validatedFields.data.address.usCongressionalDistrict = `${usCongressionalDistrict.districtNumber}`
    }
  } catch (error) {
    logger.error('error getting `usCongressionalDistrict`:' + error)
    Sentry.captureException(error, {
      tags: {
        domain: 'actionCreateUserActionEmailCongressperson',
        message: 'error getting usCongressionalDistrict',
      },
    })
  }

  const localUser = await parseLocalUserFromCookies()
  const { user, userState } = await maybeUpsertUser({
    existingUser: userMatch.user,
    input: validatedFields.data,
    sessionId,
    localUser,
    onUpsertUser: triggerRateLimiterAtMostOnce,
    tenantId,
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
      ...convertAddressToAnalyticsProperties(validatedFields.data.address),
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(user) }
  }

  await triggerRateLimiterAtMostOnce()

  userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType,
      tenantId,
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
          tenantId,
          address: {
            connectOrCreate: {
              where: { googlePlaceId: validatedFields.data.address.googlePlaceId },
              create: { ...validatedFields.data.address, tenantId },
            },
          },
          userActionEmailRecipients: {
            createMany: {
              data: validatedFields.data.dtsiSlugs.map(dtsiSlug => ({ dtsiSlug })),
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
    'Recipient DTSI Slug': validatedFields.data.dtsiSlugs,
    creationMethod: 'On Site',
    userState,
    ...convertAddressToAnalyticsProperties(validatedFields.data.address),
  })
  peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(validatedFields.data.address),
    // https://docs.mixpanel.com/docs/data-structure/user-profiles#reserved-user-properties
    $email: validatedFields.data.emailAddress,
    $name: userFullName(validatedFields.data),
  })

  /**
   * Send email via Capitol Canary, and add user to Capitol Canary email subscriber list.
   * Inngest will create a new advocate in Capitol Canary if we do not have the user's advocate ID, or will reuse an existing advocate.
   * By this point, the email address and physical address should have been added to our database.
   */
  await inngest.send({
    name: CAPITOL_CANARY_EMAIL_INNGEST_EVENT_NAME,
    data: {
      campaignId: getCapitalCanaryCampaignId(validatedFields.data.politicianCategory),
      user: {
        ...user,
        address: user.address!,
      },
      userEmailAddress: user.userEmailAddresses.find(
        emailAddr => emailAddr.emailAddress === validatedFields.data.emailAddress,
      ),
      opts: {
        isEmailOptin: true,
      },
      emailSubject: validatedFields.data.subject,
      emailMessage: validatedFields.data.contactMessage,
    },
  })

  waitUntil(beforeFinish())
  return { user: getClientUser(user) }
}

function getCapitalCanaryCampaignId(politicianCategory: YourPoliticianCategory) {
  if (NEXT_PUBLIC_ENVIRONMENT !== 'production') {
    switch (politicianCategory) {
      case 'senate':
        return SandboxCapitolCanaryCampaignId.DEFAULT_EMAIL_SENATORS
      case 'house':
        return SandboxCapitolCanaryCampaignId.DEFAULT_EMAIL_REPRESENTATIVE
      case 'senate-and-house':
        return SandboxCapitolCanaryCampaignId.DEFAULT_EMAIL_REPRESENTATIVE_AND_SENATORS
    }
  }

  switch (politicianCategory) {
    case 'senate':
      return CapitolCanaryCampaignId.DEFAULT_EMAIL_SENATORS
    case 'house':
      return CapitolCanaryCampaignId.DEFAULT_EMAIL_REPRESENTATIVE
    case 'senate-and-house':
      return CapitolCanaryCampaignId.DEFAULT_EMAIL_REPRESENTATIVE_AND_SENATORS
  }
}

async function maybeUpsertUser({
  existingUser,
  input,
  sessionId,
  localUser,
  onUpsertUser,
  tenantId,
}: {
  existingUser: UserWithRelations | null
  input: Input
  sessionId: string
  localUser: ServerLocalUser | null
  onUpsertUser: () => Promise<void> | void
  tenantId: string
}): Promise<{ user: UserWithRelations; userState: AnalyticsUserActionUserState }> {
  const { firstName, lastName, emailAddress, address } = input

  if (existingUser) {
    const updatePayload: Prisma.UserUpdateInput = {
      ...(firstName && firstName !== existingUser.firstName && { firstName }),
      ...(lastName && lastName !== existingUser.lastName && { lastName }),
      ...(!existingUser.hasOptedInToEmails && { hasOptedInToEmails: true }),
      ...(emailAddress &&
        existingUser.userEmailAddresses.every(addr => addr.emailAddress !== emailAddress) && {
          userEmailAddresses: {
            create: {
              emailAddress,
              isVerified: false,
              source: UserEmailAddressSource.USER_ENTERED,
              tenantId,
            },
          },
        }),
      ...(address &&
        existingUser.address?.googlePlaceId !== address.googlePlaceId && {
          address: {
            connectOrCreate: {
              where: { googlePlaceId: address.googlePlaceId },
              create: { ...address, tenantId },
            },
          },
        }),
      tenantId,
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
        address: true,
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
      address: true,
    },
    data: {
      ...mapLocalUserToUserDatabaseFields(localUser),
      referralId: generateReferralId(),
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      userSessions: { create: { id: sessionId } },
      hasOptedInToEmails: true,
      hasOptedInToMembership: false,
      smsStatus: SMSStatus.NOT_OPTED_IN,
      firstName,
      lastName,
      userEmailAddresses: {
        create: {
          emailAddress,
          isVerified: false,
          source: UserEmailAddressSource.USER_ENTERED,
          tenantId,
        },
      },
      address: {
        connectOrCreate: {
          where: { googlePlaceId: address.googlePlaceId },
          create: { ...address, tenantId },
        },
      },
      tenantId,
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
