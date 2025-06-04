import { getIntlUrls } from '@/utils/shared/urls'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'

type Nullable<T> = T | null

export type IntlUrls = ReturnType<typeof getIntlUrls>

export type LocalPolicyStates = Record<string, string>

export type SearchErrorCode = Nullable<'COUNTRY_NOT_SUPPORTED' | 'STATE_NOT_FOUND'>

export type SearchResult = Nullable<
  Awaited<ReturnType<typeof convertGooglePlaceAutoPredictionToAddressSchema>>
>

export type SearchErrorMap = Record<NonNullable<SearchErrorCode>, string>
