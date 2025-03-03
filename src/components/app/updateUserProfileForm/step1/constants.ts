import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export const DEFAULT_DISCLAIMER =
  'You are about to change your viewing country based on the address you have chosen'

export const DISCLAIMERS_BY_COUNTRY_CODE: Record<
  (typeof ORDERED_SUPPORTED_COUNTRIES)[number],
  string
> = {
  us: 'You are about to change your viewing country based on the address you have chosen',
  gb: 'You are about to change your viewing country based on the address you have chosen',
  ca: 'You are about to change your viewing country based on the address you have chosen',
  au: 'You are about to change your viewing country based on the address you have chosen',
}
