'use server'
import 'server-only'

import {
  Address,
  Prisma,
  User,
  UserActionLetterStatus,
  UserActionType,
  UserCryptoAddress,
  UserEmailAddress,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import { getUserAccessLocationCookie } from '@/utils/server/getUserAccessLocationCookie'
import { POSTGRID_STATUS_TO_LETTER_STATUS } from '@/utils/server/postgrid/contants'
import { sendLetter } from '@/utils/server/postgrid/sendLetter'
import { prismaClient } from '@/utils/server/prismaClient'
import { getQuorumPoliticianAddress } from '@/utils/server/quorum/getQuorumPoliticianAddress'
import { getQuorumPoliticianByDTSIPerson } from '@/utils/server/quorum/getQuorumPoliticianFromDTSIPerson'
import type { NormalizedQuorumAddress } from '@/utils/server/quorum/utils/fetchQuorum'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { userFullName } from '@/utils/shared/userFullName'
import { withSafeParseWithMetadata } from '@/utils/shared/zod'
import {
  type PostGridRecipientContact,
  type PostGridSenderContact,
  zodPostGridRecipientAddress,
} from '@/validation/fields/zodPostGridAddress'
import { zodUserActionFormLetterAction } from '@/validation/forms/zodUserActionFormLetter'

const actionType = UserActionType.LETTER

const logger = getLogger(`actionCreateUserActionLetter`)

type UserWithRelations = User & {
  primaryUserCryptoAddress: UserCryptoAddress | null
  userEmailAddresses: UserEmailAddress[]
  address: Address | null
}
type Input = z.infer<typeof zodUserActionFormLetterAction>

export const actionCreateUserActionLetter = withServerActionMiddleware(
  'actionCreateUserActionLetter',
  withValidations(
    [createCountryCodeValidation([SupportedCountryCodes.AU])],
    _actionCreateUserActionLetter,
  ),
)

async function _actionCreateUserActionLetter(input: Input) {
  logger.info('triggered')
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'authenticated',
  })

  const countryCode = (await getUserAccessLocationCookie())!
  const validatedFields = withSafeParseWithMetadata(zodUserActionFormLetterAction, input)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      errorsMetadata: validatedFields.errorsMetadata,
    }
  }
  logger.info('validated fields')

  const sessionId = await getUserSessionId()
  const localUser = await parseLocalUserFromCookies()

  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    const error = new Error('Create User Action Letter - Not authenticated')
    Sentry.captureException(error, {
      tags: { domain: 'actionCreateUserActionLetter' },
      extra: { sessionId },
    })
    throw error
  }

  const user = await prismaClient.user.findFirstOrThrow({
    where: { id: authUser.userId },
    include: {
      primaryUserCryptoAddress: true,
      userEmailAddresses: true,
      address: true,
    },
  })
  logger.info('found authenticated user')

  const updatePayload: Prisma.UserUpdateInput = {
    ...(validatedFields.data.firstName &&
      validatedFields.data.firstName !== user.firstName && {
        firstName: validatedFields.data.firstName,
      }),
    ...(validatedFields.data.lastName &&
      validatedFields.data.lastName !== user.lastName && {
        lastName: validatedFields.data.lastName,
      }),
    ...(validatedFields.data.address &&
      user.address?.googlePlaceId !== validatedFields.data.address.googlePlaceId && {
        address: {
          connectOrCreate: {
            where: { googlePlaceId: validatedFields.data.address.googlePlaceId },
            create: validatedFields.data.address,
          },
        },
      }),
    countryCode,
  }

  const hasUpdates = Object.keys(updatePayload).length > 0
  const updatedUser = hasUpdates
    ? await prismaClient.user.update({
        where: { id: user.id },
        data: updatePayload,
        include: {
          primaryUserCryptoAddress: true,
          userEmailAddresses: true,
          address: true,
        },
      })
    : user

  const analytics = getServerAnalytics({ userId: user.id, localUser })
  const peopleAnalytics = getServerPeopleAnalytics({ userId: user.id, localUser })
  const beforeFinish = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  if (localUser) {
    peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }
  logger.info('fetched user')

  const campaignName = validatedFields.data.campaignName

  const existingUserAction = await prismaClient.userAction.findFirst({
    where: {
      actionType,
      campaignName,
      userId: user.id,
    },
    include: {
      userActionLetter: true,
    },
  })

  if (existingUserAction && process.env.USER_ACTION_BYPASS_SPAM_CHECK !== 'true') {
    analytics.trackUserActionCreatedIgnored({
      actionType,
      campaignName,
      reason: 'Already Exists',
      creationMethod: 'On Site',
      userState: hasUpdates ? 'Existing With Updates' : 'Existing',
      ...convertAddressToAnalyticsProperties(validatedFields.data.address),
    })
    waitUntil(beforeFinish())
    return { user: getClientUser(updatedUser) }
  }

  await triggerRateLimiterAtMostOnce()

  const fromAddress: PostGridSenderContact = validatedFields.data.senderAddress

  const recipientResults = await Promise.all(
    validatedFields.data.dtsiPeople.map(dtsiPerson =>
      buildLetterToRecipient({
        dtsiPerson,
        countryCode,
        campaignName,
        userId: user.id,
        fromAddress,
        templateId: validatedFields.data.templateId,
      }),
    ),
  )

  await createUserAction({
    user: updatedUser,
    sessionId,
    countryCode,
    recipients: recipientResults,
    formData: validatedFields.data,
  })

  analytics.trackUserActionCreated({
    actionType,
    campaignName,
    'Recipient DTSI Slug': validatedFields.data.dtsiSlugs,
    creationMethod: 'On Site',
    userState: hasUpdates ? 'Existing With Updates' : 'Existing',
    ...convertAddressToAnalyticsProperties(validatedFields.data.address),
  })
  peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(validatedFields.data.address),
    $name: userFullName(validatedFields.data),
  })

  waitUntil(beforeFinish())
  return { user: getClientUser(updatedUser) }
}

const isValidAddress = (
  officeAddress: NormalizedQuorumAddress | null | undefined,
  fullAddress: string | null | undefined,
): officeAddress is NonNullable<NormalizedQuorumAddress> => {
  if (!officeAddress || !fullAddress) return false

  // Require essential fields for mailing
  const hasEssentialFields =
    !!officeAddress.street1 &&
    !!officeAddress.city &&
    !!officeAddress.state &&
    !!officeAddress.zipcode

  return hasEssentialFields
}

async function buildLetterToRecipient({
  dtsiPerson,
  countryCode,
  campaignName,
  userId,
  fromAddress,
  templateId,
}: {
  dtsiPerson: Input['dtsiPeople'][number]
  countryCode: SupportedCountryCodes
  campaignName: string
  userId: string
  fromAddress: PostGridSenderContact
  templateId: string
}): Promise<{
  letter: Awaited<ReturnType<typeof sendLetter>> | null
  dtsiPerson: Input['dtsiPeople'][number]
  recipientAddress: string | null
}> {
  const quorumPolitician = await getQuorumPoliticianByDTSIPerson({
    countryCode,
    person: dtsiPerson,
  })

  const quorumAddress = quorumPolitician
    ? await getQuorumPoliticianAddress(quorumPolitician.id)
    : undefined

  logger.info('Found quorum address: ', quorumAddress)

  if (!quorumPolitician || !isValidAddress(quorumAddress?.officeAddress, quorumAddress?.address)) {
    const errorMessage = !quorumPolitician
      ? `No Quorum politician match found for ${dtsiPerson.slug}`
      : `No valid office address available from Quorum for ${dtsiPerson.slug} (Quorum ID: ${quorumPolitician.id})`

    Sentry.captureException(new Error(errorMessage), {
      tags: {
        domain: 'actionCreateUserActionLetter',
        countryCode,
        issue: !quorumPolitician ? 'missing-quorum-politician-match' : 'missing-office-address',
      },
      extra: {
        dtsiSlug: dtsiPerson.slug,
        campaignName,
        ...(!!quorumPolitician && { quorumId: quorumPolitician.id }),
        ...(!!quorumAddress && { quorumAddress: JSON.stringify(quorumAddress) }),
      },
    })

    return {
      letter: null,
      dtsiPerson,
      recipientAddress: null,
    }
  }

  const toAddress: PostGridRecipientContact = zodPostGridRecipientAddress.parse({
    firstName: dtsiPerson.firstName,
    lastName: dtsiPerson.lastName,
    addressLine1: quorumAddress.address || quorumAddress.officeAddress.street1,
    addressLine2: quorumAddress.officeAddress.street2,
    city: quorumAddress.officeAddress.city,
    provinceOrState: quorumAddress.officeAddress.state,
    postalOrZip: quorumAddress.officeAddress.zipcode,
    countryCode,
    metadata: {
      dtsiSlug: dtsiPerson.slug,
    },
  })

  const letter = await sendLetter({
    to: toAddress,
    from: fromAddress,
    templateId,
    metadata: {
      userId,
      campaignName,
      countryCode,
      dtsiSlug: dtsiPerson.slug,
    },
  })

  return {
    letter,
    dtsiPerson,
    recipientAddress: quorumAddress.address!,
  }
}

async function createUserAction({
  user,
  sessionId,
  countryCode,
  recipients,
  formData,
}: {
  user: UserWithRelations
  sessionId: string
  countryCode: SupportedCountryCodes
  recipients: Array<{
    letter: Awaited<ReturnType<typeof sendLetter>> | null
    dtsiPerson: Input['dtsiPeople'][number]
    recipientAddress: string | null
  }>
  formData: Input
}) {
  await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType,
      countryCode,
      campaignName: formData.campaignName,
      ...(user.primaryUserCryptoAddress
        ? {
            userCryptoAddress: { connect: { id: user.primaryUserCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sessionId } } }),
      userActionLetter: {
        create: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: {
            connectOrCreate: {
              where: { googlePlaceId: formData.address.googlePlaceId },
              create: formData.address,
            },
          },
          userActionLetterRecipients: {
            create: recipients.map(result => ({
              dtsiSlug: result.dtsiPerson.slug,
              officeAddress: result?.recipientAddress || '',
              postgridOrderId: result?.letter?.id,
              userActionLetterStatusUpdates: {
                create: {
                  status: result?.letter?.status
                    ? POSTGRID_STATUS_TO_LETTER_STATUS[result.letter.status]
                    : UserActionLetterStatus.UNKNOWN,
                  postgridUpdatedAt: result?.letter?.updatedAt
                    ? new Date(result.letter.updatedAt)
                    : result?.letter?.createdAt
                      ? new Date(result.letter.createdAt)
                      : undefined,
                },
              },
            })),
          },
        },
      },
    },
    include: {
      userActionLetter: {
        include: {
          userActionLetterRecipients: true,
        },
      },
    },
  })
}
