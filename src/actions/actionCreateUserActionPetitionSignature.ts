'use server'
import 'server-only'

import { Address, User, UserActionType, UserCryptoAddress, UserEmailAddress } from '@prisma/client'
import { waitUntil } from '@vercel/functions'
import { z, ZodError } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { getPetitionCountryCodeValidator } from '@/components/app/userActionFormPetitionSignature/utils/getPetitionCountryCodeValidator'
import { getPetitionBySlugFromAPI } from '@/data/petitions/getPetitionBySlugFromAPI'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { getUserAccessLocationCookie } from '@/utils/server/getUserAccessLocationCookie'
import { getServerLanguage, getServerTranslation } from '@/utils/server/i18n/getServerTranslation'
import { prismaClient } from '@/utils/server/prismaClient'
import { getRequestRateLimiter } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies, ServerLocalUser } from '@/utils/server/serverLocalUser'
import { getUserSessionId } from '@/utils/server/serverUserSessionId'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { createCountryCodeValidation } from '@/utils/server/userActionValidation/checkCountryCode'
import { withValidations } from '@/utils/server/userActionValidation/withValidations'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { mergeI18nMessages } from '@/utils/shared/i18n/mergeI18nMessages'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { userFullName } from '@/utils/shared/userFullName'
import { zodAddress } from '@/validation/fields/zodAddress'
import {
  createUserActionFormPetitionSignatureAction,
  userActionFormPetitionSignatureI18nMessages,
  type UserActionPetitionSignatureActionValues as Input,
} from '@/validation/forms/zodUserActionFormPetitionSignature'

const logger = getLogger('actionCreateUserActionPetitionSignature')

interface ActionContext {
  sessionId: string
  countryCode: string
  localUser: ServerLocalUser | null
  language: SupportedLanguages
  triggerRateLimiterAtMostOnce: () => Promise<void>
}

interface PetitionActionResult {
  user: ReturnType<typeof getClientUser> | null
  errors?: Record<string, string[]>
}

type AddressData = z.infer<typeof zodAddress>

type UserWithRelations = User & {
  primaryUserCryptoAddress: UserCryptoAddress | null
  userEmailAddresses: UserEmailAddress[]
  address: Address | null
}

type UserMatch = NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>['userMatch']

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      petitionNotFound: 'Petition not found',
      userNotAuthenticated: 'User must be authenticated to sign petition',
      wrongCountryCode: 'Address country code does not match petition country code',
    },
    de: {
      petitionNotFound: 'Petition nicht gefunden',
      userNotAuthenticated:
        'Der Benutzer muss authentifiziert sein, um eine Petition zu unterzeichnen',
      wrongCountryCode: 'Die Adressen-Ländercode stimmt nicht mit dem Petition-Ländercode überein',
    },
    fr: {
      petitionNotFound: 'Pétition non trouvée',
      userNotAuthenticated: "L'utilisateur doit être authentifié pour signer la pétition",
      wrongCountryCode:
        "Le code du pays de l'adresse ne correspond pas au code du pays de la pétition",
    },
  },
})

async function _actionCreateUserActionPetitionSignature(
  input: Input,
  { countryCode }: { countryCode: SupportedCountryCodes },
): Promise<PetitionActionResult> {
  logger.info('Petition signature action triggered')

  const context = await setupActionContext()

  const { t } = await getServerTranslation(
    mergeI18nMessages(i18nMessages, userActionFormPetitionSignatureI18nMessages),
    'actionCreateUserActionPetitionSignature',
    countryCode,
    context.language,
  )

  const petition = await getPetitionBySlugFromAPI(countryCode, input.campaignName)

  if (!petition) {
    return {
      user: null,
      errors: { root: [t('petitionNotFound')] },
    }
  }

  const validationResult = createUserActionFormPetitionSignatureAction(t).safeParse(input)

  if (!validationResult.success) {
    return handleValidationError(validationResult.error)
  }

  logger.info('Input validation successful')

  const authResult = await getAuthenticatedUser()

  if (!authResult) {
    return {
      user: null,
      errors: { root: [t('userNotAuthenticated')] },
    }
  }

  const { user, userMatch } = authResult
  const addressData = validationResult.data.address

  const validateCountryCode = getPetitionCountryCodeValidator(
    petition.countryCode.toLowerCase() as SupportedCountryCodes,
  )

  if (!validateCountryCode(addressData.countryCode)) {
    logger.error('Address country code does not match petition country code')

    return {
      user: null,
      errors: { root: [t('wrongCountryCode')] },
    }
  }

  const { analytics, peopleAnalytics, flushAnalytics } = setupAnalytics(user.id, context.localUser)

  const isDuplicate = await checkForDuplicatePetition(user, validationResult.data.campaignName)

  if (isDuplicate) {
    return await handleDuplicatePetitionSignature({
      user,
      campaignName: validationResult.data.campaignName,
      addressData,
      analytics,
      flushAnalytics,
    })
  }

  await context.triggerRateLimiterAtMostOnce()
  return await createPetitionSignatureAction({
    input: validationResult.data,
    user,
    userMatch,
    addressData,
    context,
    analytics,
    peopleAnalytics,
    flushAnalytics,
  })
}

async function setupActionContext(): Promise<ActionContext> {
  const sessionId = await getUserSessionId()
  const countryCode = await getUserAccessLocationCookie()
  const language = await getServerLanguage()
  const localUser = await parseLocalUserFromCookies()
  const { triggerRateLimiterAtMostOnce } = getRequestRateLimiter({
    context: 'authenticated',
  })

  return { sessionId, countryCode, localUser, triggerRateLimiterAtMostOnce, language }
}

function handleValidationError(error: ZodError): PetitionActionResult {
  const fieldErrors = error.flatten().fieldErrors
  const filteredErrors: Record<string, string[]> = {}

  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value) {
      filteredErrors[key] = value
    }
  }

  return {
    user: null,
    errors: filteredErrors,
  }
}

async function getAuthenticatedUser() {
  const userMatch = await getMaybeUserAndMethodOfMatch({
    prisma: {
      include: {
        primaryUserCryptoAddress: true,
        userEmailAddresses: true,
        address: true,
      },
    },
  })

  if (!userMatch.user) {
    return null
  }

  logger.info('Found authenticated user')
  return { user: userMatch.user, userMatch }
}

async function checkForDuplicatePetition(
  user: UserWithRelations,
  campaignName: string,
): Promise<boolean> {
  if (process.env.USER_ACTION_BYPASS_SPAM_CHECK === 'true') {
    return false
  }

  const existingAction = await prismaClient.userAction.findFirst({
    where: {
      actionType: UserActionType.SIGN_PETITION,
      campaignName,
      userId: user.id,
    },
    include: { userActionPetition: true },
  })

  return !!existingAction
}

function setupAnalytics(userId: string, localUser: ServerLocalUser | null) {
  const analytics = getServerAnalytics({ userId, localUser })
  const peopleAnalytics = getServerPeopleAnalytics({ userId, localUser })

  if (localUser) {
    peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
  }

  const flushAnalytics = () => Promise.all([analytics.flush(), peopleAnalytics.flush()])

  return { analytics, peopleAnalytics, flushAnalytics }
}

async function createPetitionUserAction({
  input,
  user,
  userMatch,
  sessionId,
  countryCode,
  addressData,
}: {
  input: Input
  user: UserWithRelations
  userMatch: UserMatch
  sessionId: string
  countryCode: string
  addressData: AddressData
}) {
  return await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.SIGN_PETITION,
      countryCode,
      campaignName: input.campaignName,
      ...('userCryptoAddress' in userMatch && userMatch.userCryptoAddress
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sessionId } } }),
      userActionPetition: {
        create: {
          email: input.emailAddress,
          firstName: input.firstName,
          lastName: input.lastName,
          address: {
            connectOrCreate: {
              where: { googlePlaceId: addressData.googlePlaceId || '' },
              create: addressData,
            },
          },
        },
      },
    },
    include: { userActionPetition: { include: { address: true } } },
  })
}

export const actionCreateUserActionPetitionSignature = withServerActionMiddleware(
  'actionCreateUserActionPetitionSignature',
  withValidations(
    [createCountryCodeValidation([...ORDERED_SUPPORTED_COUNTRIES])],
    _actionCreateUserActionPetitionSignature,
  ),
)

async function handleDuplicatePetitionSignature({
  user,
  campaignName,
  addressData,
  analytics,
  flushAnalytics,
}: {
  user: UserWithRelations
  campaignName: string
  addressData: AddressData
  analytics: ReturnType<typeof getServerAnalytics>
  flushAnalytics: () => Promise<any[]>
}): Promise<PetitionActionResult> {
  analytics.trackUserActionCreatedIgnored({
    actionType: UserActionType.SIGN_PETITION,
    campaignName,
    reason: 'Already Exists',
    creationMethod: 'On Site',
    userState: 'Existing',
    ...convertAddressToAnalyticsProperties(addressData),
  })

  waitUntil(flushAnalytics())
  return { user: getClientUser(user) }
}

async function createPetitionSignatureAction({
  input,
  user,
  userMatch,
  addressData,
  context,
  analytics,
  peopleAnalytics,
  flushAnalytics,
}: {
  input: Input
  user: UserWithRelations
  userMatch: UserMatch
  addressData: AddressData
  context: ActionContext
  analytics: ReturnType<typeof getServerAnalytics>
  peopleAnalytics: ReturnType<typeof getServerPeopleAnalytics>
  flushAnalytics: () => Promise<any[]>
}): Promise<PetitionActionResult> {
  logger.info('Creating petition signature user action')

  const userAction = await createPetitionUserAction({
    input,
    user,
    userMatch,
    sessionId: context.sessionId,
    countryCode: context.countryCode,
    addressData,
  })

  const updatedUser = await prismaClient.user.update({
    where: { id: user.id },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      address: {
        connect: {
          id: userAction.userActionPetition!.addressId,
        },
      },
    },
    include: {
      primaryUserCryptoAddress: true,
      userEmailAddresses: true,
      address: true,
    },
  })

  analytics.trackUserActionCreated({
    actionType: UserActionType.SIGN_PETITION,
    campaignName: input.campaignName,
    creationMethod: 'On Site',
    userState: 'Existing',
    ...convertAddressToAnalyticsProperties(addressData),
  })

  // Set people analytics with user info
  peopleAnalytics.set({
    ...convertAddressToAnalyticsProperties(addressData),
    $email: input.emailAddress,
    $name: userFullName(input),
  })

  waitUntil(flushAnalytics())
  return { user: getClientUser(updatedUser) }
}
