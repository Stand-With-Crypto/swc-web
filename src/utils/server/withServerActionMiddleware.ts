import * as Sentry from '@sentry/nextjs'
import { headers } from 'next/headers'

export function withServerActionMiddleware<T extends (...args: any) => any>(
  name: string,
  action: T,
) {
  return function orchestratedLogic(...args: Parameters<T>) {
    return Sentry.withServerActionInstrumentation<() => Awaited<ReturnType<T>>>(
      name,
      {
        recordResponse: true,
        headers: headers(),
        // TODO figure out how to pass non-form data
        // formData: args,
      },
      () => action(...args),
    )
  }
}
