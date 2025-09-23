import * as Sentry from '@sentry/nextjs'
import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { getLocaleForLanguage } from '@/utils/shared/i18n/interpolationUtils'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { DEFAULT_LOCALE, SupportedLanguages } from '@/utils/shared/supportedLocales'
import { SWCEvents, zodEventSchemaValidation } from '@/utils/shared/zod/getSWCEvents'

const logger = getLogger(`builderIOEvents`)

export async function getEvent({
  eventSlug,
  state,
  countryCode,
}: {
  eventSlug: string
  state: string
  countryCode: SupportedCountryCodes
}) {
  try {
    const entry = await pRetry(
      () =>
        builderSDKClient.get(BuilderDataModelIdentifiers.EVENTS, {
          query: {
            data: {
              slug: eventSlug,
              state: state.toUpperCase(),
              countryCode: countryCode.toUpperCase(),
              isOccuring: true,
            },
            ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
          },
          locale: DEFAULT_LOCALE,
          includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
          cacheSeconds: 60,
        }),
      {
        retries: 3,
        minTimeout: 5000,
      },
    )

    const parsedEntry = zodEventSchemaValidation.safeParse(entry)

    if (!parsedEntry.success) {
      return null
    }

    return parsedEntry.data as SWCEvents[0]
  } catch (e) {
    logger.error('error getting single event:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'getEvents' },
    })
    return null
  }
}

const LIMIT = 100

async function getAllEventsWithOffset({
  offset,
  countryCode,
  language,
}: {
  offset: number
  countryCode: SupportedCountryCodes
  language: SupportedLanguages
}) {
  const locale = getLocaleForLanguage(language)

  return await pRetry(
    () =>
      builderSDKClient.getAll(BuilderDataModelIdentifiers.EVENTS, {
        query: {
          ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
          data: {
            isOccuring: true,
            countryCode: countryCode.toUpperCase(),
          },
        },
        locale,
        includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
        cacheSeconds: 60,
        limit: LIMIT,
        offset,
      }),
    {
      retries: 3,
      minTimeout: 10000,
    },
  )
}

export async function getEvents({
  countryCode,
  language = SupportedLanguages.EN,
}: {
  countryCode: SupportedCountryCodes
  language?: SupportedLanguages
}) {
  try {
    let offset = 0

    const entries = await getAllEventsWithOffset({ offset, countryCode, language })

    while (entries.length === LIMIT + offset) {
      offset += entries.length
      entries.push(...(await getAllEventsWithOffset({ offset, countryCode, language })))
    }

    const filteredIncompleteEvents = entries
      .map(entry => {
        const validEntry = zodEventSchemaValidation.safeParse(entry)
        return validEntry.success ? validEntry.data : null
      })
      .filter(Boolean) as SWCEvents

    if (filteredIncompleteEvents.length === 0) return null

    return filteredIncompleteEvents
  } catch (e) {
    logger.error('error getting all events:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'builder.io', model: 'events' },
    })
    return null
  }
}
