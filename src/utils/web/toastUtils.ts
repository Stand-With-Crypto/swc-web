import { useToast } from '@/components/ui/useToast'
import { FetchReqError } from '@/utils/shared/fetchReq'
import _ from 'lodash'

const GENERIC_TITLE = 'Uh oh! Something went wrong.'
const GENERIC_DESCRIPTION = "There was a problem with your request. We're investigating it now."

const formatErrorStatus = (status: number) => {
  switch (status) {
    case 401:
      return 'Please login first'
    default:
      return GENERIC_DESCRIPTION
  }
}
export const catchUnexpectedServerErrorAndTriggerToast =
  (toast: ReturnType<typeof useToast>['toast']) => (error: unknown) => {
    if (!_.isError(error)) {
      // TODO log to our error system when an invalid item is passed to this fn
      return toast({
        variant: 'destructive',
        title: GENERIC_TITLE,
        description: GENERIC_DESCRIPTION,
      })
    }
    if (error instanceof FetchReqError) {
      const formattedErrorStatus = formatErrorStatus(error.response.status)
      return toast({
        variant: 'destructive',
        title: GENERIC_TITLE,
        description: formattedErrorStatus,
      })
    }
    return toast({
      variant: 'destructive',
      title: GENERIC_TITLE,
      description: GENERIC_DESCRIPTION,
    })
  }
