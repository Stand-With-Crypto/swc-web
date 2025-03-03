import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export const DEFAULT_DISCLAIMER = {
  disclaimer: 'You are about to change your country based on the address you have chosen.',
  buttonText: 'I understand',
}

export const DISCLAIMERS_BY_COUNTRY_CODE: Record<
  (typeof ORDERED_SUPPORTED_COUNTRIES)[number],
  { disclaimer: string; buttonText: string }
> = {
  us: {
    disclaimer: 'You are about to change your country based on the address you have chosen.',
    buttonText: 'I understand',
  },
  gb: {
    disclaimer: 'You are about to change your country based on the address you have chosen.',
    buttonText: 'I understand',
  },
  ca: {
    disclaimer: 'You are about to change your country based on the address you have chosen.',
    buttonText: 'I understand',
  },
  au: {
    disclaimer: 'You are about to change your country based on the address you have chosen.',
    buttonText: 'I understand',
  },
}
