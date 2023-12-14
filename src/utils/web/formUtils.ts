import { UseFormReturn } from 'react-hook-form'

export const GENERIC_FORM_ERROR_KEY = 'FORM_ERROR' as const
export type GenericErrorFormValues = {
  FORM_ERROR?: string
}

export async function triggerServerActionForForm<
  F extends UseFormReturn<any, any, undefined>,
  Fn extends () => Promise<{ errors?: Record<string, string[]> } | { data: any }>,
>(form: F, fn: Fn) {
  const response = await fn().catch(e => ({ error: e.message }))
  if ('error' in response) {
    form.setError('FORM_ERROR', { message: response.error })
  }
  if ('errors' in response && response.errors) {
    Object.entries(response.errors).forEach(([key, val]) => {
      form.setError(key, {
        // TODO the right way of formatting multiple errors that return
        message: val.join('. '),
      })
    })
  }
}
