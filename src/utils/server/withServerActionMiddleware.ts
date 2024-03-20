import * as Sentry from '@sentry/nextjs'
import { headers } from 'next/headers'

import { getLogger } from '@/utils/shared/logger'

// sentry only allows form data to be passed but we want to support json objects as well so we need to make it form data
const convertArgsToFormData = <T extends any[]>(args: T) => {
  try {
    const data = new FormData()
    args.forEach((arg, index) => {
      for (const key in arg) {
        const formattedKey = args.length === 1 ? key : `arg ${index} - ${key}`
        data.append(formattedKey, JSON.stringify(arg[key]))
      }
    })
    return data
  } catch (e) {
    Sentry.captureException(e, { tags: { domain: 'withServerActionMiddleware' }, extra: { args } })
    return undefined
  }
}

const logger = getLogger(`withServerActionMiddleware`)

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
        formData: convertArgsToFormData(args),
      },
      () => {
        const promise = action(...args)
        promise
          .then((result: any) => {
            if (result === undefined) {
              throw new Error('Undefined result')
            }
          })
          .catch(function (e: any) {
            return logger.error(e)
          })

        return promise
      },
    )
  }
}
