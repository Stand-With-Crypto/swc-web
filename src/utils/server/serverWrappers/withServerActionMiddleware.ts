import * as Sentry from '@sentry/nextjs'
import { cookies, headers } from 'next/headers'

import { getCountryCodeFromHeaders } from '@/utils/server/getCountryCodeFromURL'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

export interface ServerActionConfig {
  countryCode: SupportedCountryCodes
}

export type ServerAction<TPayload, TReturn = any> = (
  input: TPayload,
  config: ServerActionConfig,
) => TReturn

type FirstParameter<T extends (...args: any[]) => any> = Parameters<T>[0]

export function withServerActionMiddleware<TAction extends ServerAction<any, any>>(
  name: string,
  action: TAction,
) {
  return async function orchestratedLogic(
    ...args: FirstParameter<TAction> extends undefined ? [] : [FirstParameter<TAction>]
  ): Promise<ReturnType<TAction>> {
    const currentCookies = await cookies()
    const currentHeaders = await headers()
    const userSession = currentCookies.get(USER_SESSION_ID_COOKIE_NAME)?.value

    const isBot = currentHeaders.get('x-known-bot') === 'true'
    if (isBot) {
      // Bot detection is working as expected, no need to log to Sentry
      // as this creates unnecessary noise in error tracking
      return { error: 'Blocked by known bot detection' } as Awaited<ReturnType<TAction>>
    }

    const countryCode = await getCountryCodeFromHeaders(currentHeaders)

    if (userSession) {
      Sentry.setUser({
        id: userSession,
        idType: 'session',
        geo: {
          country_code: countryCode,
        },
      })
    }

    return Sentry.withServerActionInstrumentation<() => Awaited<ReturnType<TAction>>>(
      name,
      {
        recordResponse: true,
        headers: currentHeaders,
        formData: convertArgsToFormData(args),
      },
      () => action(args[0], { countryCode }),
    )
  }
}

// sentry only allows form data to be passed but we want to support json objects as well so we need to make it form data
function convertArgsToFormData<T extends any[]>(args: T) {
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
