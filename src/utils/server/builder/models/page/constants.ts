import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export type InternationalBuilderPageModel =
  `page-${Exclude<SupportedCountryCodes, typeof DEFAULT_SUPPORTED_COUNTRY_CODE>}`

export enum BuilderPageModelIdentifiers {
  CONTENT = 'content',
  PAGE = 'page',
  PRESS = 'press',
}
