import { logger } from '@/utils/shared/logger'
import { trackFormSubmitErrored } from '@/utils/web/clientAnalytics'
import { useEffect } from 'react'
import { FormState } from 'react-hook-form'

export function useTrackSubmissionErrors(formState: FormState<any>, formName: string) {
  useEffect(() => {
    if (formState.submitCount && Object.keys(formState.errors)) {
      trackFormSubmitErrored(formName, { errorKeys: Object.keys(formState.errors) })
      logger.warn('Form submission errored', formName, formState.errors)
    }
  }, [formState.submitCount])
}
