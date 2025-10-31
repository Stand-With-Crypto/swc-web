import { postgridClient } from '@/utils/server/postgrid/postgridClient'
import { SendLetterParams } from '@/utils/server/postgrid/types'
import { getLogger } from '@/utils/shared/logger'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const logger = getLogger('sendLetter')

function getLetterSizeForCountry(countryCode: string): 'us_letter' | 'a4' {
  const US_LETTER_COUNTRIES = [SupportedCountryCodes.US, SupportedCountryCodes.CA]
  return US_LETTER_COUNTRIES.includes(countryCode.toUpperCase()) ? 'us_letter' : 'a4'
}

export async function sendLetter(params: SendLetterParams) {
  if (!postgridClient) {
    logger.debug('PostGrid client not initialized. Skipping order creation.')
    return
  }

  const { userId, campaignName, countryCode, dtsiSlug } = params.metadata
  const idempotencyKey = `${userId}:${campaignName}:${countryCode}:${dtsiSlug}`
  const letterSize = getLetterSizeForCountry(params.to.countryCode)

  const letter = await postgridClient.letters.create(
    {
      ...params,
      template: params.templateId,
      size: letterSize,
      color: true,
      description: `${campaignName} campaign`,
    },
    {
      idempotencyKey,
    },
  )

  return letter
}
