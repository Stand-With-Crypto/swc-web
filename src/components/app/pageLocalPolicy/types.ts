import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'

type Nullable<T> = T | null

type IntlUrls = ReturnType<typeof getIntlUrls>

type LocalPolicyStates = Record<string, string>

export type LocalPolicyStatesMap = Partial<Record<SupportedCountryCodes, LocalPolicyStates>>

export type SearchError = Nullable<'COUNTRY_NOT_SUPPORTED' | 'STATE_NOT_FOUND'>

export type SearchResult = Nullable<
  Awaited<ReturnType<typeof convertGooglePlaceAutoPredictionToAddressSchema>>
>

export interface PageLocalPolicyProps {
  countryCode: SupportedCountryCodes
}

export interface StateSearchProps {
  countryCode: SupportedCountryCodes
  setSearchError: React.Dispatch<React.SetStateAction<SearchError>>
  setSearchResult: React.Dispatch<React.SetStateAction<SearchResult>>
}

export interface SearchErrorMessageProps {
  error: NonNullable<SearchError>
}

export interface SearchResultStateProps {
  countryCode: SupportedCountryCodes
  result: NonNullable<SearchResult>
  states: LocalPolicyStates
  urls: IntlUrls
}

export interface StateCardProps {
  countryCode: SupportedCountryCodes
  state: { code: string; name: string }
  urls: IntlUrls
}

export interface StateListProps {
  searchResult: SearchResult
  states: LocalPolicyStates
  urls: IntlUrls
}
