import { FetchReqError } from '@/utils/shared/fetchReq'
import { logger } from '@/utils/shared/logger'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import {
  trackFormSubmitSucceeded,
  trackFormSubmitted,
  trackFormSubmitErrored,
} from '@/utils/web/clientAnalytics'
import { formatErrorStatus } from '@/utils/web/errorUtils'
import * as Sentry from '@sentry/nextjs'
import _ from 'lodash'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

export const GENERIC_FORM_ERROR_KEY = 'FORM_ERROR' as const
export type GenericErrorFormValues = {
  FORM_ERROR?: string
}

export type FormValues<T extends z.ZodType<any, any, any>> = z.infer<T> & GenericErrorFormValues

export async function triggerServerActionForForm<
  F extends UseFormReturn<any, any, undefined>,
  Fn extends () => Promise<{ errors: Record<string, string[]> } | object>,
>(
  {
    form,
    formName,
    analyticsProps,
    onError = form?.setError ?? _.noop,
  }: {
    form?: F
    formName: string
    analyticsProps?: AnalyticProperties
    onError?: (key: string, error: { message: string }) => void
  },
  fn: Fn,
) {
  trackFormSubmitted(formName, analyticsProps)

  const response = await fn().catch(error => {
    if (!_.isError(error)) {
      trackFormSubmitErrored(formName, { 'Error Type': 'Unknown', ...analyticsProps })
      onError(GENERIC_FORM_ERROR_KEY, { message: error })
      Sentry.captureMessage(`triggerServerActionForForm returned unexpected form response`, {
        extra: { analyticsProps, error, formName },
        tags: { domain: 'triggerServerActionForForm', formName, path: 'Unexpected' },
      })
    } else if (error instanceof FetchReqError) {
      const formattedErrorStatus = formatErrorStatus(error.response.status)
      trackFormSubmitErrored(formName, { 'Error Type': error.response.status, ...analyticsProps })
      onError(GENERIC_FORM_ERROR_KEY, { message: formattedErrorStatus })
      Sentry.captureException(error, {
        extra: { analyticsProps, error, formName },
        fingerprint: [formName, 'FetchReqError', `${error.response.status}`],
        tags: { domain: 'triggerServerActionForForm', formName, path: 'FetchReqError' },
      })
    } else {
      trackFormSubmitErrored(formName, { 'Error Type': 'Unexpected', ...analyticsProps })
      onError(GENERIC_FORM_ERROR_KEY, { message: error.message })
      Sentry.captureException(error, {
        extra: { analyticsProps, error, formName },
        fingerprint: [formName, 'Error', error.message],
        tags: { domain: 'triggerServerActionForForm', formName, path: 'Error' },
      })
    }
    return { status: 'error' as const }
  })
  if ('status' in response) {
    return { status: response.status }
  }
  if ('errors' in response) {
    trackFormSubmitErrored(formName, { 'Error Type': 'Validation', ...analyticsProps })
    Object.entries(response.errors).forEach(([key, val]) => {
      onError(key, {
        // LATER-TASK the right way of formatting multiple errors that return
        message: val.join('. '),
      })
    })
    Sentry.captureMessage('Field errors returned from action', {
      extra: { analyticsProps, formName, response },
      tags: { domain: 'triggerServerActionForForm', formName, path: 'Error' },
    })
    return { status: 'error' as const }
  }
  trackFormSubmitSucceeded(formName, analyticsProps)
  return { response, status: 'success' as const }
}

export const trackFormSubmissionSyncErrors =
  (formName: string) =>
  <T extends object>(errors: T) => {
    trackFormSubmitErrored(formName, { errorKeys: Object.keys(errors) })
    logger.warn('Form submission errored', formName, errors)
  }
