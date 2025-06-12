import Fuse from 'fuse.js'
import { uniqBy } from 'lodash-es'

import { NormalizedQuorumPolitician } from '@/utils/server/quorum/utils/fetchQuorum'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('matchQuorumPoliticianWithDTSIPerson')

const normalizeString = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// The more close to 0, the more strict the match is
const FUSE_THRESHOLD = 0.4

interface DTSIPersonToMatch {
  firstName: string
  lastName: string
  firstNickname: string
}

export function matchQuorumPoliticianWithDTSIPerson(
  quorumPoliticians: NormalizedQuorumPolitician[],
  dtsiPerson: DTSIPersonToMatch,
): NormalizedQuorumPolitician | null {
  if (quorumPoliticians.length === 0) {
    return null
  }

  const fuseOptions = {
    includeScore: true,
    threshold: FUSE_THRESHOLD,
    keys: [
      {
        name: 'name',
        weight: 3,
      },
      {
        name: 'email',
        weight: 1,
      },
    ],
    location: 0,
    distance: 100,
    minMatchCharLength: 2,
  }

  const normalizedDTSIPerson = {
    firstName: normalizeString(dtsiPerson.firstName),
    lastName: normalizeString(dtsiPerson.lastName),
    firstNickname: normalizeString(dtsiPerson.firstNickname),
  }

  logger.info(`Normalized DTSI Person: ${JSON.stringify(normalizedDTSIPerson)}`)

  const uniqueQuorumPoliticians = uniqBy([...quorumPoliticians], 'id').map(quorumPolitician => ({
    ...quorumPolitician,
    id: quorumPolitician.id,
    firstName: normalizeString(quorumPolitician.firstName),
    lastName: normalizeString(quorumPolitician.lastName),
    middleName: normalizeString(quorumPolitician.middleName),
    email: quorumPolitician.email,
  }))

  const fuse = new Fuse(
    [
      ...uniqueQuorumPoliticians.map(quorumPolitician => ({
        id: quorumPolitician.id,
        name: `${quorumPolitician.firstName} ${quorumPolitician.lastName}`,
        email: quorumPolitician.email,
      })),
      ...uniqueQuorumPoliticians
        .filter(quorumPoliticians => quorumPoliticians.middleName.length > 0)
        .map(quorumPolitician => ({
          id: quorumPolitician.id,
          name: `${quorumPolitician.firstName} ${quorumPolitician.middleName} ${quorumPolitician.lastName}`,
          email: quorumPolitician.email,
        })),
    ],
    fuseOptions,
  )

  const searchQueries = [
    `${normalizedDTSIPerson.firstName} ${normalizedDTSIPerson.lastName}`,
    ...(normalizedDTSIPerson.firstNickname
      ? [`${normalizedDTSIPerson.firstNickname} ${normalizedDTSIPerson.lastName}`]
      : []),
  ]

  const results = searchQueries
    .map(query => {
      logger.info(`Searching for ${query}`)
      return fuse.search(query)
    })
    .flat()
    .sort((a, b) => {
      if (!a?.score || !b?.score) return 0
      return a.score - b.score
    })

  logger.info(`Results: ${JSON.stringify(results)}`)

  const highestScoreResult = results?.[0]

  if (highestScoreResult?.score && highestScoreResult.score > FUSE_THRESHOLD) {
    return null
  }

  const quorumPoliticianMatch = quorumPoliticians.find(
    quorumPolitician => quorumPolitician.id === highestScoreResult?.item?.id,
  )

  return quorumPoliticianMatch ?? null
}
