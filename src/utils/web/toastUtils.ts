import * as Sentry from '@sentry/nextjs'
import Cookies from 'js-cookie'
import { isError } from 'lodash-es'
import { toast } from 'sonner'

import { FetchReqError } from '@/utils/shared/fetchReq'
import { formatErrorStatus, i18nMessages } from '@/utils/web/errorUtils'

const LANGUAGE_COOKIE_NAME = 'swc-page-language'

export const catchUnexpectedServerErrorAndTriggerToast = (error: unknown) => {
  if (!isError(error)) {
    Sentry.captureMessage(
      'Unexpected error type passed to catchUnexpectedServerErrorAndTriggerToast',
      {
        tags: { domain: 'catchUnexpectedServerErrorAndTriggerToast' },
        extra: { error },
      },
    )
    toastGenericError()
    return
  }
  if (error instanceof FetchReqError) {
    const language = Cookies.get(LANGUAGE_COOKIE_NAME)?.toLowerCase()
    const GENERIC_ERROR_TITLE =
      i18nMessages[language as keyof typeof i18nMessages]['error.generic.title'] ?? ''
    const formattedErrorStatus = formatErrorStatus(error.response.status)
    toast.error(GENERIC_ERROR_TITLE, {
      description: formattedErrorStatus,
      duration: 5000,
    })
    return
  }
  toastGenericError()
}

export const toastGenericError = () => {
  const language = Cookies.get(LANGUAGE_COOKIE_NAME)?.toLowerCase()
  const GENERIC_ERROR_TITLE =
    i18nMessages[language as keyof typeof i18nMessages]['error.generic.title'] ?? ''
  const GENERIC_ERROR_DESCRIPTION =
    i18nMessages[language as keyof typeof i18nMessages]['error.generic.description'] ?? ''

  toast.error(GENERIC_ERROR_TITLE, {
    description: GENERIC_ERROR_DESCRIPTION,
    duration: 5000,
  })
}
