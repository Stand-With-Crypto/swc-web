import { UseFormReturn } from 'react-hook-form'
import * as Sentry from '@sentry/nextjs'
import { isError, noop } from 'lodash-es'
import { z } from 'zod'

import { FetchReqError } from '@/utils/shared/fetchReq'
import { logger } from '@/utils/shared/logger'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import {
  trackFormSubmitErrored,
  trackFormSubmitSucceeded,
  trackFormSubmitted,
} from '@/utils/web/clientAnalytics'
import { formatErrorStatus } from '@/utils/web/errorUtils'

export const GENERIC_FORM_ERROR_KEY = 'FORM_ERROR' as const
export type GenericErrorFormValues = {
  FORM_ERROR?: string
}

export type FormValues<T extends z.ZodType<any, any, any>> = z.infer<T> & GenericErrorFormValues

export async function triggerServerActionForForm<
  F extends UseFormReturn<any, any, any>,
  Fn extends () => Promise<{ errors: Record<string, string[]> } | object>,
>(
  {
    form,
    formName,
    analyticsProps,
    onError = form?.setError ?? noop,
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
    if (!isError(error)) {
      trackFormSubmitErrored(formName, { 'Error Type': 'Unknown', ...analyticsProps })
      onError(GENERIC_FORM_ERROR_KEY, { message: error })
      Sentry.captureMessage(`triggerServerActionForForm returned unexpected form response`, {
        tags: { formName, domain: 'triggerServerActionForForm', path: 'Unexpected' },
        extra: { analyticsProps, error, formName },
      })
    } else if (error instanceof FetchReqError) {
      const formattedErrorStatus = formatErrorStatus(error.response.status)
      trackFormSubmitErrored(formName, { 'Error Type': error.response.status, ...analyticsProps })
      onError(GENERIC_FORM_ERROR_KEY, { message: formattedErrorStatus })
      Sentry.captureException(error, {
        fingerprint: [formName, 'FetchReqError', `${error.response.status}`],
        tags: { formName, domain: 'triggerServerActionForForm', path: 'FetchReqError' },
        extra: { analyticsProps, error, formName },
      })
    } else {
      trackFormSubmitErrored(formName, { 'Error Type': 'Unexpected', ...analyticsProps })
      onError(GENERIC_FORM_ERROR_KEY, { message: error.message })
      Sentry.captureException(error, {
        fingerprint: [formName, 'Error', error.message],
        tags: { formName, domain: 'triggerServerActionForForm', path: 'Error' },
        extra: { analyticsProps, error, formName },
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
      tags: { formName, domain: 'triggerServerActionForForm', path: 'Error' },
      extra: { analyticsProps, response, formName },
    })
    return { status: 'error' as const }
  }
  trackFormSubmitSucceeded(formName, analyticsProps)
  return { status: 'success' as const, response }
}

export const trackFormSubmissionSyncErrors =
  (formName: string) =>
  <T extends object>(errors: T) => {
    trackFormSubmitErrored(formName, { errorKeys: Object.keys(errors) })
    logger.warn('Form submission errored', formName, errors)
  }
