import { Logger } from 'inngest/middleware/logger'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { getGooglePlaceIdFromAddress } from '@/utils/server/getGooglePlaceIdFromAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

const BACKFILL_USER_COUNTRY_CODE_EMPTY_INNGEST_EVENT_NAME =
  'script/backfill-user-country-code-empty'
const BACKFILL_USER_COUNTRY_CODE_EMPTY_INNGEST_FUNCTION_ID =
  'script.backfill-user-country-code-empty'

export interface BackfillUserCountryCodeEmptyInngestSchema {
  name: typeof BACKFILL_USER_COUNTRY_CODE_EMPTY_INNGEST_EVENT_NAME
  data: {
    persist: boolean
    onlyUS: boolean
  }
}

const GOOGLE_PLACES_BACKEND_API_KEY = requiredEnv(
  process.env.GOOGLE_PLACES_BACKEND_API_KEY,
  'GOOGLE_PLACES_BACKEND_API_KEY',
)

export const backfillUserCountryCodeEmptyWithInngest = inngest.createFunction(
  {
    id: BACKFILL_USER_COUNTRY_CODE_EMPTY_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: BACKFILL_USER_COUNTRY_CODE_EMPTY_INNGEST_EVENT_NAME },
  async ({ event, step, logger }) => {
    const { persist, onlyUS } = event.data

    const usersWithoutCountryCode = await step.run(
      'get users without country code',
      async () =>
        await prismaClient.user.findMany({
          select: {
            id: true,
            countryCode: true,
            address: {
              select: {
                formattedDescription: true,
                googlePlaceId: true,
              },
            },
          },
          where: {
            countryCode: {
              equals: '',
            },
          },
        }),
    )

    await step.run('update users without country code', async () => {
      for (const user of usersWithoutCountryCode) {
        if (onlyUS) {
          logger.info('Setting only US', {
            userId: user.id,
            countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE,
          })

          await updateUserCountryCode(user.id, DEFAULT_SUPPORTED_COUNTRY_CODE, persist, logger)

          continue
        }

        if (!user.address?.formattedDescription && !user.address?.googlePlaceId) {
          logger.info('No address whatsoever. Using default country code', {
            userId: user.id,
            countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE,
          })

          await updateUserCountryCode(user.id, DEFAULT_SUPPORTED_COUNTRY_CODE, persist, logger)

          continue
        }

        try {
          const googlePlaceId =
            user.address?.googlePlaceId ||
            (await getGooglePlaceIdFromAddress(user.address?.formattedDescription || ''))

          const countryCodeFromPlaceId = await getCountryCodeFromGooglePlaceId(
            googlePlaceId,
            logger,
          )

          if (!countryCodeFromPlaceId) {
            logger.info('No country code found. Using default country code', {
              userId: user.id,
              countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE,
            })

            await updateUserCountryCode(user.id, DEFAULT_SUPPORTED_COUNTRY_CODE, persist, logger)

            continue
          }

          logger.info('New countryCode found', {
            userId: user.id,
            countryCode: countryCodeFromPlaceId,
          })

          await updateUserCountryCode(user.id, countryCodeFromPlaceId, persist, logger)
        } catch (error) {
          logger.error('Error getting google place id', {
            userId: user.id,
            error,
          })

          await updateUserCountryCode(user.id, DEFAULT_SUPPORTED_COUNTRY_CODE, persist, logger)
        }
      }

      logger.info(`Updated ${usersWithoutCountryCode.length} users without country code`)

      return {
        success: true,
        message: persist
          ? `Updated ${usersWithoutCountryCode.length} users without country code`
          : `Would have updated ${usersWithoutCountryCode.length} users without country code`,
        usersWithoutCountryCode,
      }
    })
  },
)

async function updateUserCountryCode(
  userId: string,
  countryCode: string,
  persist: boolean,
  logger: Logger,
) {
  if (!persist) {
    logger.info(`Would have updated user ${userId} with country code ${countryCode}`)

    return Promise.resolve()
  }

  await prismaClient.user.update({
    where: { id: userId },
    data: { countryCode },
  })
}

async function getCountryCodeFromGooglePlaceId(googlePlaceId: string, logger: Logger) {
  const response = await fetchReq(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      googlePlaceId,
    )}&key=${GOOGLE_PLACES_BACKEND_API_KEY}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

  const data = (await response.json()) as {
    result: Pick<google.maps.places.PlaceResult, 'address_components'>
  }

  if (!data?.result) {
    logger.error('No result', JSON.stringify({ googlePlaceId }, null, 2))

    return null
  }

  const addressComponents = data.result.address_components
  const countryCodeFromAddress = addressComponents?.find(x =>
    x.types.includes('country'),
  )?.short_name

  const validatedCountryCode = zodSupportedCountryCode.safeParse(
    countryCodeFromAddress?.toLowerCase(),
  )

  if (!validatedCountryCode.success) {
    logger.error(
      'Invalid country code',
      JSON.stringify({ googlePlaceId, countryCodeFromAddress }, null, 2),
    )

    return null
  }

  return validatedCountryCode.data
}
