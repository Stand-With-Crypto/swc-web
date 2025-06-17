import { DTSIPersonByElectoralZone } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import { NormalizedQuorumPolitician } from '@/utils/server/quorum/utils/fetchQuorum'
import {
  normalizeQuorumElectoralZone,
  normalizeQuorumString,
} from '@/utils/server/quorum/utils/quorumNormalizers'
import { getLogger } from '@/utils/shared/logger'
import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const logger = getLogger('matchQuorumPoliticianWithDTSIPerson')

interface NormalizedDTSIPerson {
  slug: string
  firstName: string
  lastName: string
  firstNickname: string
  electoralZone?: string
  state?: string
}

export function matchQuorumPoliticianWithDTSIPerson({
  quorumPoliticians,
  dtsiPerson,
  countryCode,
}: {
  quorumPoliticians: NormalizedQuorumPolitician[]
  dtsiPerson: DTSIPersonByElectoralZone
  countryCode: SupportedCountryCodes
}) {
  if (quorumPoliticians.length === 0) {
    return
  }

  const normalizedDTSIPersonElectoralZone = dtsiPerson.primaryRole?.primaryDistrict
    ? normalizeQuorumElectoralZone(dtsiPerson.primaryRole.primaryDistrict)
    : undefined

  const normalizedDTSIPersonState = dtsiPerson.primaryRole?.primaryState.toUpperCase()

  const normalizedDTSIPerson: NormalizedDTSIPerson = {
    slug: dtsiPerson.slug,
    firstName: normalizeQuorumString(dtsiPerson.firstName),
    lastName: normalizeQuorumString(dtsiPerson.lastName),
    firstNickname: normalizeQuorumString(dtsiPerson.firstNickname),
    electoralZone: normalizedDTSIPersonElectoralZone,
    state: normalizedDTSIPersonState,
  }

  logger.info('normalizedDTSIPerson', normalizedDTSIPerson)

  const normalizedQuorumPoliticians = quorumPoliticians.map(quorumPolitician => ({
    ...quorumPolitician,
    firstName: normalizeQuorumString(quorumPolitician.firstName),
    lastName: normalizeQuorumString(quorumPolitician.lastName),
    middleName: normalizeQuorumString(quorumPolitician.middleName),
    // US at large is 1
    regionRepresented: quorumPolitician.regionRepresented
      ? normalizeQuorumElectoralZone(quorumPolitician.regionRepresented)
      : undefined,
    stateRepresented: quorumPolitician.stateRepresented?.toUpperCase(),
  }))

  const maybeExactMatches = normalizedQuorumPoliticians.filter(quorumPolitician => {
    if (
      quorumPolitician.firstName === normalizedDTSIPerson.firstName &&
      quorumPolitician.lastName === normalizedDTSIPerson.lastName
    ) {
      return true
    }

    if (
      quorumPolitician.firstName === normalizedDTSIPerson.firstNickname &&
      quorumPolitician.lastName === normalizedDTSIPerson.lastName
    ) {
      return true
    }

    const dtsiPersonFullName = `${normalizedDTSIPerson.firstName} ${normalizedDTSIPerson.lastName}`
    const dtsiPersonFullNameWithNickname = `${normalizedDTSIPerson.firstNickname} ${normalizedDTSIPerson.lastName}`

    const quorumPersonFullName = `${quorumPolitician.firstName} ${quorumPolitician.lastName}`

    if (dtsiPersonFullName === quorumPersonFullName) {
      return true
    }

    if (dtsiPersonFullNameWithNickname === quorumPersonFullName) {
      return true
    }

    if (quorumPolitician.middleName.length > 0) {
      const quorumPersonFullNameWithMiddleName = `${quorumPolitician.firstName} ${quorumPolitician.middleName} ${quorumPolitician.lastName}`

      if (dtsiPersonFullName === quorumPersonFullNameWithMiddleName) {
        return true
      }

      if (dtsiPersonFullNameWithNickname === quorumPersonFullNameWithMiddleName) {
        return true
      }
    }
  })

  logger.info('maybeExactMatches', maybeExactMatches)

  let possibleMatch = maybeFindPossibleMatch({
    normalizedDTSIPerson,
    normalizedQuorumPoliticians: maybeExactMatches,
    countryCode,
  })

  if (possibleMatch) {
    return possibleMatch
  }

  const dtsiPersonLastNames = normalizedDTSIPerson.lastName.replace(/-/g, ' ').split(' ')

  const maybeMatchesByLastName = normalizedQuorumPoliticians.filter(quorumPolitician => {
    const quorumPoliticianLastNames = quorumPolitician.lastName.replace(/-/g, ' ').split(' ')

    return quorumPoliticianLastNames.some(lastName => dtsiPersonLastNames.includes(lastName))
  })

  logger.info('maybeMatchesByLastName', maybeMatchesByLastName)

  possibleMatch = maybeFindPossibleMatch({
    normalizedDTSIPerson,
    normalizedQuorumPoliticians: maybeMatchesByLastName,
    countryCode,
  })

  if (possibleMatch) {
    return possibleMatch
  }
}

function maybeFindPossibleMatch({
  normalizedDTSIPerson,
  normalizedQuorumPoliticians,
  countryCode,
}: {
  normalizedDTSIPerson: NormalizedDTSIPerson
  normalizedQuorumPoliticians: NormalizedQuorumPolitician[]
  countryCode: SupportedCountryCodes
}) {
  function maybeGetPossibleMatch(by: string, possibleMatches: NormalizedQuorumPolitician[]) {
    logger.info(`Checking possible matches by ${by}`, possibleMatches)

    if (possibleMatches.length === 1) {
      return possibleMatches[0]
    }

    if (possibleMatches.length > 1) {
      // If all the possible matches have the same name and last name, we can return the first one
      const maybePossibleMatch = possibleMatches[0]

      if (
        possibleMatches.every(quorumPolitician => {
          return (
            quorumPolitician.firstName === maybePossibleMatch.firstName &&
            quorumPolitician.lastName === maybePossibleMatch.lastName
          )
        })
      ) {
        return maybePossibleMatch
      }
    }
  }

  let possibleMatch: NormalizedQuorumPolitician | undefined = undefined

  if (
    countryCode === SupportedCountryCodes.US &&
    normalizedDTSIPerson.state &&
    normalizedDTSIPerson.electoralZone
  ) {
    // US politicians in Quorum have a property called name, which includes the state and district in the format: John Smith (R-NY-1)
    const quorumDistrictMatchingString = `${normalizedDTSIPerson.state}-${normalizedDTSIPerson.electoralZone}`

    const possibleMatchesByElectoralZone = normalizedQuorumPoliticians.filter(quorumPolitician => {
      return quorumPolitician.nameAndTitle.includes(quorumDistrictMatchingString)
    })

    possibleMatch = maybeGetPossibleMatch('electoralZone', possibleMatchesByElectoralZone)

    if (possibleMatch) {
      return possibleMatch
    }
  } else {
    // In Quorum, all US Representatives have their role_state set to DC, so we can't use state to match US politicians
    const possibleMatchesByElectoralZone = normalizedQuorumPoliticians.filter(quorumPolitician => {
      const normalizedQuorumPoliticianRegionRepresented = quorumPolitician.regionRepresented
        ? normalizeQuorumElectoralZone(quorumPolitician.regionRepresented)
        : undefined

      if (
        countryCode === SupportedCountryCodes.AU &&
        normalizedDTSIPerson.state &&
        normalizedDTSIPerson.electoralZone
      ) {
        const auStateName = getAUStateNameFromStateCode(normalizedDTSIPerson.state)

        // Most of the MPs in Australia have their region represented as a string with the format: "region, state"
        const dtsiAURegionRepresented = normalizeQuorumElectoralZone(
          `${normalizedDTSIPerson.electoralZone}, ${auStateName}`,
        )

        if (
          normalizedQuorumPoliticianRegionRepresented &&
          dtsiAURegionRepresented === normalizedQuorumPoliticianRegionRepresented
        ) {
          return true
        }
      }

      return (
        normalizedQuorumPoliticianRegionRepresented &&
        normalizedQuorumPoliticianRegionRepresented === normalizedDTSIPerson.electoralZone
      )
    })

    possibleMatch = maybeGetPossibleMatch('electoralZone', possibleMatchesByElectoralZone)

    if (possibleMatch) {
      return possibleMatch
    }

    const possibleMatchesByState = normalizedQuorumPoliticians.filter(
      quorumPolitician =>
        quorumPolitician.stateRepresented &&
        quorumPolitician.stateRepresented.toUpperCase() ===
          normalizedDTSIPerson.state?.toUpperCase(),
    )

    possibleMatch = maybeGetPossibleMatch('state', possibleMatchesByState)

    if (possibleMatch) {
      return possibleMatch
    }
  }

  possibleMatch = maybeGetPossibleMatch('all', normalizedQuorumPoliticians)

  if (possibleMatch) {
    return possibleMatch
  }
}
