import { object, string } from 'zod'

import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { Translator } from '@/utils/shared/i18n/createTranslator'

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

export const createZodGooglePlacesAutocompletePredictionWithI18n = (t: Translator['t']) =>
  object(
    {
      place_id: string(),
      description: string(),
    },
    {
      required_error: t('pleaseSelectAValidAddress'),
      invalid_type_error: t('pleaseSelectAValidAddress'),
    },
  )

const i18nMessages = createI18nMessages({
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
