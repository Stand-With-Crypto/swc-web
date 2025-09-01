import Cookies from 'js-cookie'

import { getServerTranslation } from '@/utils/i18n/getServerTranslation'

export const i18nMessages = {
  en: {
    'error.generic.title': 'Uh oh! Something went wrong.',
    'error.generic.description':
      "There was a problem with your request. We're investigating it now.",
    'error.status.401': 'Please login first',
  },
  de: {
    'error.generic.title': 'Oh nein! Etwas ist schief gelaufen.',
    'error.generic.description': 'Es gab ein Problem mit Ihrer Anfrage. Wir untersuchen es gerade.',
    'error.status.401': 'Bitte melden Sie sich zuerst an',
  },
  fr: {
    'error.generic.title': 'Oh là là ! Quelque chose a mal tourné.',
    'error.generic.description':
      'Il y a eu un problème avec votre demande. Nous enquêtons maintenant.',
    'error.status.401': "Veuillez vous connecter d'abord",
  },
}

export const formatErrorStatus = async (status: number) => {
  const { t } = await getServerTranslation(i18nMessages)

  switch (status) {
    case 401:
      return t('error.status.401')
    default:
      return t('error.generic.description')
  }
}

export function getTranslatedGenericError() {
  const language = Cookies.get('swc-page-language')?.toLowerCase()
  const genericErrorTitle =
    i18nMessages[language as keyof typeof i18nMessages]['error.generic.title'] ?? ''
  const genericErrorDescription =
    i18nMessages[language as keyof typeof i18nMessages]['error.generic.description'] ?? ''
  return {
    genericErrorTitle,
    genericErrorDescription,
  }
}
