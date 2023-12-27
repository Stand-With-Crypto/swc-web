import { useToast } from '@/components/ui/useToast'
import { REPLACE_ME__captureException } from '@/utils/shared/captureException'
import { FetchReqError } from '@/utils/shared/fetchReq'
import {
  GENERIC_ERROR_DESCRIPTION,
  GENERIC_ERROR_TITLE,
  formatErrorStatus,
} from '@/utils/web/errorUtils'
import _ from 'lodash'

export const catchUnexpectedServerErrorAndTriggerToast =
  (toast: ReturnType<typeof useToast>['toast']) => (error: unknown) => {
    if (!_.isError(error)) {
      // TODO log to our error system when an invalid item is passed to this fn
      REPLACE_ME__captureException(
        new Error('Unexpected error type passed to catchUnexpectedServerErrorAndTriggerToast'),
      )
      toast({
        variant: 'destructive',
        title: GENERIC_ERROR_TITLE,
        description: GENERIC_ERROR_DESCRIPTION,
      })
      return
    }
    if (error instanceof FetchReqError) {
      const formattedErrorStatus = formatErrorStatus(error.response.status)
      toast({
        variant: 'destructive',
        title: GENERIC_ERROR_TITLE,
        description: formattedErrorStatus,
      })
      return
    }
    toast({
      variant: 'destructive',
      title: GENERIC_ERROR_TITLE,
      description: GENERIC_ERROR_DESCRIPTION,
    })
  }
