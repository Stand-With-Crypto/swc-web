import { UserActionTweetCountryConfig } from '@/components/app/userActionFormShareOnTwitter/common/types'
import { ukConfig } from '@/components/app/userActionFormShareOnTwitter/uk'
import { usConfig } from '@/components/app/userActionFormShareOnTwitter/us'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export const USER_ACTION_TWEET_CONTENT_BY_COUNTRY: Record<
  SupportedCountryCodes,
  UserActionTweetCountryConfig
> = {
  [SupportedCountryCodes.US]: usConfig,
  [SupportedCountryCodes.GB]: ukConfig,
  [SupportedCountryCodes.CA]: usConfig,
  [SupportedCountryCodes.AU]: usConfig,
}

export function getUserActionTweetContentByCountry(countryCode: SupportedCountryCodes) {
  if (countryCode in USER_ACTION_TWEET_CONTENT_BY_COUNTRY) {
    return USER_ACTION_TWEET_CONTENT_BY_COUNTRY[countryCode]
  }

  return gracefullyError({
    msg: `Country config not found for country code: ${countryCode}`,
    fallback: USER_ACTION_TWEET_CONTENT_BY_COUNTRY[DEFAULT_SUPPORTED_COUNTRY_CODE],
    hint: {
      level: 'error',
      tags: {
        domain: 'getUserActionTweetCountryConfig',
      },
      extra: {
        countryCode,
      },
    },
  })
}
