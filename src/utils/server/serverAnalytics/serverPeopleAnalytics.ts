import * as Sentry from '@sentry/nextjs'

import { LocalUser } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { resolveWithTimeout } from '@/utils/shared/resolveWithTimeout'
import { AnalyticsPeopleProperties } from '@/utils/shared/sharedAnalytics'

import { ANALYTICS_FLUSH_TIMEOUT_MS, mixpanel } from './shared'

const logger = getLogger('serverPeopleAnalytics')

interface ServerAnalyticsConfig {
  localUser: LocalUser | null
  userId: string
}

export type ServerPeopleAnalytics = ReturnType<typeof getServerPeopleAnalytics>

/**
 * @remarks — Remember to always call and wait `flush()` at the end of the scope
 */
export function getServerPeopleAnalytics(config: ServerAnalyticsConfig) {
  const trackingRequests: Promise<void>[] = []

  const flush = async () => {
    return resolveWithTimeout(Promise.all(trackingRequests), ANALYTICS_FLUSH_TIMEOUT_MS).catch(
      () => {},
    )
  }

  // this allows for one line calls (e.g.: `await getServerPeopleAnalytics().set().flush()`)
  const returnValue = { flush }

  const onError =
    (extra: { method: string; userId: string; peopleProperties?: AnalyticsPeopleProperties }) =>
    // Any is the typing of `Sentry.captureException`
    (err: any) => {
      Sentry.captureException(err, {
        tags: { domain: 'serverPeopleAnalytics' },
        extra,
        fingerprint: err?.message?.includes('Request timeout')
          ? [`trackPeopleAnalyticResolveWithTimeout`]
          : undefined,
      })
    }

  const setOnce = (peopleProperties: AnalyticsPeopleProperties): typeof returnValue => {
    if (!config.localUser) {
      logger.info(`Skipped People Properties Set Once`, peopleProperties)
      return returnValue
    }

    logger.info(`People Properties Set Once`, peopleProperties)

    void trackingRequests.push(
      new Promise<void>((resolve, reject) =>
        mixpanel.people.set_once(config.userId, peopleProperties, err =>
          err ? reject(err) : resolve(),
        ),
      ).catch(onError({ method: 'setOnce', userId: config.userId, peopleProperties })),
    )

    return returnValue
  }

  const set = (peopleProperties: AnalyticsPeopleProperties) => {
    if (!config.localUser) {
      logger.info(`Skipped People Properties Set`, peopleProperties)
      return returnValue
    }
    logger.info(`People Properties Set`, peopleProperties)

    void trackingRequests.push(
      new Promise<void>((resolve, reject) =>
        mixpanel.people.set(config.userId, peopleProperties, err =>
          err ? reject(err) : resolve(),
        ),
      ).catch(onError({ method: 'set', userId: config.userId, peopleProperties })),
    )

    return returnValue
  }

  return { setOnce, set, flush }
}
