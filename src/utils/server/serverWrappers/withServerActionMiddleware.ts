import * as Sentry from '@sentry/nextjs'
import { cookies, headers } from 'next/headers'

import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

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

export function withServerActionMiddleware<T extends (...args: any) => any>(
  name: string,
  action: T,
) {
  return async function orchestratedLogic(...args: Parameters<T>) {
    const currentCookies = await cookies()
    const currentHeaders = await headers()
    const userSession = currentCookies.get(USER_SESSION_ID_COOKIE_NAME)?.value

    if (userSession) {
      Sentry.setUser({
        id: userSession,
        idType: 'session',
      })
    }

    return Sentry.withServerActionInstrumentation<() => Awaited<ReturnType<T>> | undefined>(
      name,
      {
        recordResponse: true,
        headers: currentHeaders,
        formData: convertArgsToFormData(args),
      },
      () => action(...args),
    )
  }
}
