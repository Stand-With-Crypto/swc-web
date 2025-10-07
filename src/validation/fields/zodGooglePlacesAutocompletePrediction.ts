import { object, string } from 'zod'

import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'

export const zodGooglePlacesAutocompletePrediction = object(
  {
    place_id: string(),
    description: string(),
  },
  {
    required_error: 'Please select a valid address',
    invalid_type_error: 'Please select a valid address',
  },
)

export function createZodGooglePlacesAutocompletePredictionWithI18n(
  t: (key: 'pleaseSelectAValidAddress') => string,
) {
  return object(
    {
      place_id: string(),
      description: string(),
    },
    {
      required_error: t('pleaseSelectAValidAddress'),
      invalid_type_error: t('pleaseSelectAValidAddress'),
    },
  )
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      pleaseSelectAValidAddress: 'Please select a valid address',
    },
    de: {
      pleaseSelectAValidAddress: 'Bitte wählen Sie eine gültige Adresse',
    },
    fr: {
      pleaseSelectAValidAddress: 'Veuillez sélectionner une adresse valide',
    },
  },
})

export const zodGooglePlacesAutocompletePredictionI18nMessages = i18nMessages
