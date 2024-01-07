import * as Sentry from '@sentry/nextjs'
import { FetchReqError } from '@/utils/shared/fetchReq'
import {
  GENERIC_ERROR_DESCRIPTION,
  GENERIC_ERROR_TITLE,
  formatErrorStatus,
} from '@/utils/web/errorUtils'
import _ from 'lodash'
import { toast } from 'sonner'

export const catchUnexpectedServerErrorAndTriggerToast = (error: unknown) => {
  if (!_.isError(error)) {
    Sentry.captureMessage(
      'Unexpected error type passed to catchUnexpectedServerErrorAndTriggerToast',
      {
        tags: { domain: 'catchUnexpectedServerErrorAndTriggerToast' },
        extra: { error },
      },
    )
    toast.error(GENERIC_ERROR_TITLE, {
      description: GENERIC_ERROR_DESCRIPTION,
      duration: 5000,
    })
    return
  }
  if (error instanceof FetchReqError) {
    const formattedErrorStatus = formatErrorStatus(error.response.status)
    toast.error(GENERIC_ERROR_TITLE, {
      description: formattedErrorStatus,
      duration: 5000,
    })
    return
  }
  toast.error(GENERIC_ERROR_TITLE, {
    description: GENERIC_ERROR_DESCRIPTION,
    duration: 5000,
  })
}
