import { REPLACE_ME__captureException } from '@/utils/shared/captureException'
import { FetchReqError } from '@/utils/shared/fetchReq'
import {
  ClientAnalyticProperties,
  trackClientAnalytic,
  trackFormSubmitErrored,
  trackFormSubmitSucceeded,
  trackFormSubmitted,
} from '@/utils/web/clientAnalytics'
import { formatErrorStatus } from '@/utils/web/errorUtils'
import _ from 'lodash'
import { UseFormReturn } from 'react-hook-form'

export const GENERIC_FORM_ERROR_KEY = 'FORM_ERROR' as const
export type GenericErrorFormValues = {
  FORM_ERROR?: string
}

export async function triggerServerActionForForm<
  F extends UseFormReturn<any, any, undefined>,
  Fn extends () => Promise<{ errors?: Record<string, string[]> } | { data: any }>,
>({ form, formName }: { form: F; formName: string }, fn: Fn) {
  trackFormSubmitted(formName)
  const response = await fn().catch(error => {
    if (!_.isError(error)) {
      trackFormSubmitErrored(formName, { 'Error Type': 'Unknown' })
      form.setError(GENERIC_FORM_ERROR_KEY, { message: error })
      REPLACE_ME__captureException(new Error(`Unexpected form response returned from ${formName}`))
    } else if (error instanceof FetchReqError) {
      const formattedErrorStatus = formatErrorStatus(error.response.status)
      trackFormSubmitErrored(formName, { 'Error Type': error.response.status })
      form.setError(GENERIC_FORM_ERROR_KEY, { message: formattedErrorStatus })
    } else {
      trackFormSubmitErrored(formName, { 'Error Type': 'Unexpected' })
      form.setError(GENERIC_FORM_ERROR_KEY, { message: error.message })
    }
  })
  if (response && 'errors' in response && response.errors) {
    trackFormSubmitErrored(formName, { 'Error Type': 'Validation' })
    Object.entries(response.errors).forEach(([key, val]) => {
      form.setError(key, {
        // TODO the right way of formatting multiple errors that return
        message: val.join('. '),
      })
    })
  } else {
    trackFormSubmitSucceeded(formName)
  }
}
