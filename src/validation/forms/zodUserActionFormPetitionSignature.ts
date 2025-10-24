import z, { object, string } from 'zod'

import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { mergeI18nMessages } from '@/utils/shared/i18n/mergeI18nMessages'
import { GenericErrorFormValues } from '@/utils/web/formUtils'
import { zodAddress } from '@/validation/fields/zodAddress'
import {
  createZodGooglePlacesAutocompletePredictionWithI18n,
  zodGooglePlacesAutocompletePredictionI18nMessages,
} from '@/validation/fields/zodGooglePlacesAutocompletePrediction'

type I18nMessagesKeys =
  | 'firstNameRequired'
  | 'lastNameRequired'
  | 'emailAddressInvalid'
  | 'campaignNameRequired'
  | 'addressRequired'
  | 'addressCouldNotBeFound'
  | 'pleaseSelectAValidAddress'

export function createZodSchemaWithI18n(t: (key: I18nMessagesKeys) => string) {
  return object({
    firstName: string().min(1, t('firstNameRequired')),
    lastName: string().min(1, t('lastNameRequired')),
    emailAddress: string().email(t('emailAddressInvalid')),
    campaignName: string().min(1, t('campaignNameRequired')),
    address: createZodGooglePlacesAutocompletePredictionWithI18n(t).nullable(),
  })
}

// For client-side form (uses GooglePlaceAutocompletePrediction)
export function createUserActionFormPetitionSignature(t: (key: I18nMessagesKeys) => string) {
  return createZodSchemaWithI18n(t).extend({
    address: createZodGooglePlacesAutocompletePredictionWithI18n(t).nullable(),
  })
}

// For server action (uses converted Address)
export function createUserActionFormPetitionSignatureAction(t: (key: I18nMessagesKeys) => string) {
  return createZodSchemaWithI18n(t)
    .extend({
      address: zodAddress.nullable(),
    })
    .refine(data => data.address !== null, {
      message: t('addressCouldNotBeFound'),
      path: ['address'],
    })
    .transform(data => ({
      ...data,
      address: data.address!,
    }))
}

export type UserActionPetitionSignatureValues = z.infer<
  ReturnType<typeof createUserActionFormPetitionSignature>
> &
  GenericErrorFormValues
export type UserActionPetitionSignatureActionValues = z.infer<
  ReturnType<typeof createUserActionFormPetitionSignatureAction>
>

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      firstNameRequired: 'First name is required',
      lastNameRequired: 'Last name is required',
      emailAddressInvalid: 'Please enter a valid email address',
      campaignNameRequired: 'Campaign name is required',
      addressRequired: 'Address is required',
      addressCouldNotBeFound: 'Address could not be found',
    },
    de: {
      firstNameRequired: 'Vorname ist erforderlich',
      lastNameRequired: 'Nachname ist erforderlich',
      emailAddressInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      campaignNameRequired: 'Kampagnenname ist erforderlich',
      addressRequired: 'Adresse ist erforderlich',
      addressCouldNotBeFound: 'Adresse konnte nicht gefunden werden',
    },
    fr: {
      firstNameRequired: 'Le prénom est requis',
      lastNameRequired: 'Le nom de famille est requis',
      emailAddressInvalid: 'Veuillez saisir une adresse e-mail valide',
      campaignNameRequired: 'Le nom de la campagne est requis',
      addressRequired: "L'adresse est requise",
      addressCouldNotBeFound: "L'adresse n'a pas pu être trouvée",
    },
  },
})

export const zodUserActionFormPetitionSignatureI18nMessages = mergeI18nMessages(
  i18nMessages,
  zodGooglePlacesAutocompletePredictionI18nMessages,
)
