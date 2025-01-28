import { UseFormReturn } from 'react-hook-form'
import type { ScopeContext } from '@sentry/core'
import * as Sentry from '@sentry/nextjs'
import { isError, noop } from 'lodash-es'

import { FetchReqError } from '@/utils/shared/fetchReq'
import { logger } from '@/utils/shared/logger'
import { AnalyticProperties } from '@/utils/shared/sharedAnalytics'
import { ZodDescribeMetadata } from '@/utils/shared/zod'
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

export async function triggerServerActionForForm<
  F extends UseFormReturn<any, any, any>,
  P,
  Fn extends (args: P) => Promise<
    | {
        errors: Record<string, string[]>
        errorsMetadata?: Record<keyof P, ZodDescribeMetadata>
      }
    | object
    | undefined
  >,
>(
  {
    form,
    formName,
    analyticsProps,
    onError = form?.setError ?? noop,
    payload,
    errorScopeContext = {},
  }: {
    payload: P
    form?: F
    formName: string
    analyticsProps?: AnalyticProperties
    onError?: (key: string, error: { message: string }) => void
    errorScopeContext?: Partial<ScopeContext>
  },
  fn: Fn,
) {
  trackFormSubmitted(formName, analyticsProps)

  const response = await fn(payload).catch(error => {
    if (!isError(error)) {
      trackFormSubmitErrored(formName, { 'Error Type': 'Unknown', ...analyticsProps })
      onError(GENERIC_FORM_ERROR_KEY, { message: error })
      Sentry.captureMessage(`triggerServerActionForForm returned unexpected form response`, {
        ...errorScopeContext,
        tags: { formName, domain: 'triggerServerActionForForm', path: 'Unexpected' },
        extra: { analyticsProps, error, formName, payload },
      })
    } else if (error instanceof FetchReqError) {
      const formattedErrorStatus = formatErrorStatus(error.response.status)
      trackFormSubmitErrored(formName, { 'Error Type': error.response.status, ...analyticsProps })
      onError(GENERIC_FORM_ERROR_KEY, { message: formattedErrorStatus })
      Sentry.captureException(error, {
        ...errorScopeContext,
        fingerprint: [formName, 'FetchReqError', `${error.response.status}`],
        tags: { formName, domain: 'triggerServerActionForForm', path: 'FetchReqError' },
        extra: { analyticsProps, error, formName, payload },
        ...(error.response.status === 401 && { level: 'warning' }),
      })
    } else {
      trackFormSubmitErrored(formName, { 'Error Type': 'Unexpected', ...analyticsProps })
      onError(GENERIC_FORM_ERROR_KEY, { message: error.message })
      Sentry.captureException(error, {
        ...errorScopeContext,
        fingerprint: [formName, 'Error', error.message],
        tags: { formName, domain: 'triggerServerActionForForm', path: 'Error' },
        extra: { analyticsProps, error, formName, payload },
      })
    }
    return { status: 'error' as const }
  })
  if (!response) {
    /*
      There's a weird bug where we are sometimes returning undefined here for situations where the type signature says that should be impossible.
      Adding some additional logging here to debug whats going on
      https://stand-with-crypto.sentry.io/issues/5018950536/?environment=production&project=4506490717470720&query=is%3Aunresolved+timesSeen%3A%3E%3D10&referrer=issue-stream&statsPeriod=30d&stream_index=4
      */
    Sentry.captureMessage(
      'triggerServerActionForForm unexpectedly successfully returned undefined',
      { extra: { payload, response, formName } },
    )
    return { status: 'error' as const }
  }
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

      if ('errorsMetadata' in response && response.errorsMetadata) {
        Object.keys(response.errorsMetadata).forEach(errorMetadataField => {
          const metadata = response.errorsMetadata?.[errorMetadataField as keyof P]

          if (metadata) {
            const { triggerException, severityLevel, message } = metadata

            if (triggerException) {
              Sentry.captureException(
                message ?? response.errors[errorMetadataField]?.join('. ') ?? '',
                {
                  level: severityLevel ?? 'error',
                  extra: {
                    errorMetadataField,
                    analyticsProps,
                    response,
                    formName,
                    payload,
                  },
                },
              )
            }
          }
        })
      }
    })

    Sentry.captureMessage('Field errors returned from action', {
      fingerprint: [`Field errors returned from action ${formName}`],
      tags: { formName, domain: 'triggerServerActionForForm', path: 'Error' },
      extra: { analyticsProps, response, formName, payload },
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
