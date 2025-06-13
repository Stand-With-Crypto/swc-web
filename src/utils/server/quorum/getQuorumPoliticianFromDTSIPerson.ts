import * as Sentry from '@sentry/node'
import { DTSIPersonByElectoralZone } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import {
  fetchQuorumByAdvancedSearch,
  fetchQuorumByPersonId,
  NormalizedQuorumPolitician,
} from '@/utils/server/quorum/utils/fetchQuorum'
import { matchQuorumPoliticianWithDTSIPerson } from '@/utils/server/quorum/utils/matchQuorumPoliticianWithDTSIPerson'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { redis } from '@/utils/server/redis'
import { normalizeQuorumString } from '@/utils/server/quorum/utils/quorumNormalizers'
import { getLogger } from '@/utils/shared/logger'

const QUORUM_POLITICIANS_CACHE_KEY = 'quorum:politicians'

const logger = getLogger('getQuorumPoliticianByDTSIPerson')

function getPersonLastName(person: DTSIPersonByElectoralZone) {
  return normalizeQuorumString(person.lastName.split(' ').at(-1) ?? person.lastName)
}

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

  const lastName = getPersonLastName(person)

  let limit = undefined

  if (lastName.toLowerCase() === 'smith' && countryCode === SupportedCountryCodes.GB) {
    limit = 200
  }

  const redisCacheKey = `${QUORUM_POLITICIANS_CACHE_KEY}:${countryCode}:${lastName}`

  const quorumPoliticians: NormalizedQuorumPolitician[] = []

  const cachedPoliticians = await redis.get<NormalizedQuorumPolitician[]>(redisCacheKey)

  if (cachedPoliticians) {
    logger.info(
      `Found ${cachedPoliticians.length} cached politicians for ${lastName} in ${countryCode}`,
    )
    quorumPoliticians.push(...cachedPoliticians)
  } else {
    logger.info(`Fetching ${lastName} in ${countryCode} from Quorum`)
    const politicians = await fetchQuorumByAdvancedSearch({
      countryCode,
      query: lastName,
      limit,
    })

    if (politicians) {
      quorumPoliticians.push(...politicians)
    }

    logger.info(`Caching ${quorumPoliticians.length} politicians for ${lastName} in ${countryCode}`)
    await redis.set(redisCacheKey, quorumPoliticians)
  }

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

const MANUAL_MATCHES: Record<SupportedCountryCodes, Record<string, string>> = {
  [SupportedCountryCodes.US]: {},
  [SupportedCountryCodes.CA]: {},
  [SupportedCountryCodes.AU]: {},
  [SupportedCountryCodes.GB]: {},
}
