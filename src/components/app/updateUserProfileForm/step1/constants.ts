import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export const DISCLAIMERS_BY_COUNTRY_CODE: Record<
  (typeof ORDERED_SUPPORTED_COUNTRIES)[number] | 'default',
  { disclaimer: string; buttonText: string }
> = {
  default: {
    disclaimer: 'You are about to change your country based on the address you have chosen.',
    buttonText: 'I understand',
  },
  us: {
    disclaimer: 'You are about to change your country based on the address you have chosen.',
    buttonText: 'I understand',
  },
}
