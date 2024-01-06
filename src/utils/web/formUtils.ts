import * as Sentry from '@sentry/nextjs'
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
      Sentry.captureMessage(`triggerServerActionForForm returned unexpected form response`, {
        tags: { formName, domain: 'triggerServerActionForForm', path: 'Unexpected' },
        extra: { error, formName },
      })
    } else if (error instanceof FetchReqError) {
      const formattedErrorStatus = formatErrorStatus(error.response.status)
      trackFormSubmitErrored(formName, { 'Error Type': error.response.status })
      form.setError(GENERIC_FORM_ERROR_KEY, { message: formattedErrorStatus })
      Sentry.captureException(error, {
        fingerprint: [formName, 'FetchReqError', `${error.response.status}`],
        tags: { formName, domain: 'triggerServerActionForForm', path: 'FetchReqError' },
        extra: { error, formName },
      })
    } else {
      trackFormSubmitErrored(formName, { 'Error Type': 'Unexpected' })
      form.setError(GENERIC_FORM_ERROR_KEY, { message: error.message })
      Sentry.captureException(error, {
        fingerprint: [formName, 'Error', error.message],
        tags: { formName, domain: 'triggerServerActionForForm', path: 'Error' },
        extra: { error, formName },
      })
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
    Sentry.captureMessage('Field errors returned from action', {
      tags: { formName, domain: 'triggerServerActionForForm', path: 'Error' },
      extra: { response, formName },
    })
  } else {
    trackFormSubmitSucceeded(formName)
  }
}
