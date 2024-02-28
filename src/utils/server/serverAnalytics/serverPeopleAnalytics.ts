import * as Sentry from '@sentry/nextjs'
import { PropertyDict } from 'mixpanel'
import { promisify } from 'util'

import { LocalUser } from '@/utils/shared/localUser'
import { getLogger } from '@/utils/shared/logger'
import { resolveWithTimeout } from '@/utils/shared/resolveWithTimeout'
import { AnalyticsPeopleProperties } from '@/utils/shared/sharedAnalytics'

import { mixpanel } from './shared'

const logger = getLogger('serverPeopleAnalytics')

type ServerAnalyticsConfig = { localUser: LocalUser | null; userId: string }

const promisifiedMixpanelPeopleSet = promisify<string, PropertyDict, void>(mixpanel.people.set)
const promisifiedMixpanelPeopleSetOnce = promisify<string, PropertyDict, void>(
  mixpanel.people.set_once,
)

export type ServerPeopleAnalytics = ReturnType<typeof getServerPeopleAnalytics>

export function getServerPeopleAnalytics(config: ServerAnalyticsConfig) {
  const trackingRequests: Promise<void>[] = []

  const flush = async () => {
    return resolveWithTimeout(Promise.all(trackingRequests), 2500)
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

  const setOnce = (peopleProperties: AnalyticsPeopleProperties) => {
    if (!config.localUser) {
      logger.info(`Skipped People Properties Set Once`, peopleProperties)
      return returnValue
    }

    logger.info(`People Properties Set Once`, peopleProperties)

    trackingRequests.push(
      promisifiedMixpanelPeopleSetOnce(config.userId, peopleProperties).catch(
        onError({ method: 'setOnce', userId: config.userId, peopleProperties }),
      ),
    )

    return returnValue
  }

  const set = (peopleProperties: AnalyticsPeopleProperties) => {
    if (!config.localUser) {
      logger.info(`Skipped People Properties Set`, peopleProperties)
      return returnValue
    }
    logger.info(`People Properties Set`, peopleProperties)

    trackingRequests.push(
      promisifiedMixpanelPeopleSet(config.userId, peopleProperties).catch(
        onError({ method: 'set', userId: config.userId, peopleProperties }),
      ),
    )

    return returnValue
  }

  return { setOnce, set, flush }
}
