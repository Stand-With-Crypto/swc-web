import * as Sentry from '@sentry/nextjs'
import { isError } from 'lodash-es'
import { toast } from 'sonner'

import { FetchReqError } from '@/utils/shared/fetchReq'
import { formatErrorStatus, getTranslatedGenericError } from '@/utils/web/errorUtils'

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
    const formattedErrorStatus = formatErrorStatus(error.response.status)
    toast.error(getTranslatedGenericError().genericErrorTitle, {
      description: formattedErrorStatus,
      duration: 5000,
    })
    return
  }
  toastGenericError()
}

export const toastGenericError = () => {
  const { genericErrorTitle, genericErrorDescription } = getTranslatedGenericError()

  toast.error(genericErrorTitle, {
    description: genericErrorDescription,
    duration: 5000,
  })
}
