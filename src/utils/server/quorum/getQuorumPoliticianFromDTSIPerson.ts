import * as Sentry from '@sentry/node'

import { DTSIPersonByElectoralZone } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import {
  fetchQuorumByAdvancedSearch,
  fetchQuorumByPersonId,
  NormalizedQuorumPolitician,
} from '@/utils/server/quorum/utils/fetchQuorum'
import { matchQuorumPoliticianWithDTSIPerson } from '@/utils/server/quorum/utils/matchQuorumPoliticianWithDTSIPerson'
import { normalizeQuorumString } from '@/utils/server/quorum/utils/quorumNormalizers'
import { redis } from '@/utils/server/redis'
import { getLogger } from '@/utils/shared/logger'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const logger = getLogger('getQuorumPoliticianByDTSIPerson')

export async function getQuorumPoliticianByDTSIPerson({
  countryCode,
  person,
}: {
  countryCode: SupportedCountryCodes
  person: DTSIPersonByElectoralZone
}) {
  const manuallyMatchedQuorumPoliticianId = MANUAL_MATCHES[countryCode][person.slug]

  if (manuallyMatchedQuorumPoliticianId) {
    logger.info(`Found manually matched quorum politician for ${person.slug} in ${countryCode}`)

    const quorumPolitician = await fetchQuorumByPersonId(manuallyMatchedQuorumPoliticianId)

    return quorumPolitician
  }

  const quorumPoliticians = await getQuorumPeopleFromPersonLastName({
    countryCode,
    lastName: person.lastName,
  })

  if (!quorumPoliticians.length) {
    return
  }

  const match = matchQuorumPoliticianWithDTSIPerson({
    quorumPoliticians,
    dtsiPerson: person,
    countryCode,
  })

  if (!match) {
    Sentry.captureMessage(`No match found for ${person.slug} in ${countryCode}`, {
      extra: {
        person,
        quorumPoliticians,
      },
      tags: {
        countryCode,
        domain: 'quorum',
      },
    })
  }

  return match
}

const QUORUM_POLITICIANS_CACHE_KEY = 'quorum:politicians'

const REDIS_CACHE_TTL = 6 * 60 * 60 // 6 hours

async function getQuorumPeopleFromPersonLastName({
  countryCode,
  lastName,
}: {
  countryCode: SupportedCountryCodes
  lastName: string
}) {
  const personLastName = normalizeQuorumString(lastName.split(' ').at(-1) ?? lastName).toLowerCase()

  let limit = undefined

  if (personLastName === 'smith' && countryCode === SupportedCountryCodes.GB) {
    limit = 200
  }

  const redisCacheKey = `${QUORUM_POLITICIANS_CACHE_KEY}:${countryCode}:${personLastName}`

  const cachedPoliticians = await redis.get<NormalizedQuorumPolitician[]>(redisCacheKey)

  if (cachedPoliticians) {
    logger.info(
      `Found ${cachedPoliticians.length} cached politicians for ${personLastName} in ${countryCode}`,
    )
    return cachedPoliticians
  } else {
    logger.info(`Fetching ${personLastName} in ${countryCode} from Quorum`)
    const politicians = await fetchQuorumByAdvancedSearch({
      countryCode,
      query: personLastName,
      limit,
    })

    if (politicians) {
      logger.info(
        `Caching ${politicians.length} politicians for ${personLastName} in ${countryCode}`,
      )
      await redis.set(redisCacheKey, politicians, {
        ex: REDIS_CACHE_TTL,
      })

      return politicians
    }
  }

  return []
}

const MANUAL_MATCHES: Record<SupportedCountryCodes, Record<string, string>> = {
  [SupportedCountryCodes.US]: {},
  [SupportedCountryCodes.CA]: {},
  [SupportedCountryCodes.AU]: {},
  [SupportedCountryCodes.GB]: {},
}
