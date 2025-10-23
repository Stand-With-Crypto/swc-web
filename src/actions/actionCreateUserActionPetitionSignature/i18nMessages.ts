import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'

// it need to be exported from a different file because we can't export objects from 'use server' files
export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      petitionNotFound: 'Petition not found',
      userNotAuthenticated: 'User must be authenticated to sign petition',
      wrongCountryCode: 'Address country code does not match petition country code',
    },
    de: {
      petitionNotFound: 'Petition nicht gefunden',
      userNotAuthenticated:
        'Der Benutzer muss authentifiziert sein, um eine Petition zu unterzeichnen',
      wrongCountryCode: 'Die Adressen-Ländercode stimmt nicht mit dem Petition-Ländercode überein',
    },
    fr: {
      petitionNotFound: 'Pétition non trouvée',
      userNotAuthenticated: "L'utilisateur doit être authentifié pour signer la pétition",
      wrongCountryCode:
        "Le code du pays de l'adresse ne correspond pas au code du pays de la pétition",
    },
  },
})

export const userActionFormPetitionSignatureI18nMessages = i18nMessages
