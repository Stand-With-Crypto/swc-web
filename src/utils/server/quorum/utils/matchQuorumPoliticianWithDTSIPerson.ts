import { NormalizedQuorumPolitician } from '@/utils/server/quorum/utils/fetchQuorum'
import { getLogger } from '@/utils/shared/logger'
import { DTSIPersonByElectoralZone } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import {
  normalizeQuorumElectoralZone,
  normalizeQuorumString,
} from '@/utils/server/quorum/utils/quorumNormalizers'

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

  const exactMatch = findExactMatch({
    countryCode,
    normalizedDTSIPerson,
    normalizedQuorumPoliticians,
  })

  logger.info('exactMatch', exactMatch)

  if (exactMatch) {
    return exactMatch
  }

  const possibleMatch = findPossibleMatch({
    normalizedDTSIPerson,
    normalizedQuorumPoliticians,
    countryCode,
  })

  logger.info('possibleMatch', possibleMatch)

  return possibleMatch
}

/**
 * Finds an exact match between a DTSI person and Quorum politicians.
 *
 * An exact match is found when:
 * 1. First name and last name match exactly
 * 2. First nickname and last name match exactly
 * 3. Full name (first + last) matches exactly
 * 4. Full name with nickname (nickname + last) matches exactly
 * 5. Full name matches Quorum's full name including middle name
 * 6. For US politicians: the state-district combination matches the nameAndTitle field
 */
function findExactMatch({
  normalizedDTSIPerson,
  normalizedQuorumPoliticians,
  countryCode,
}: {
  normalizedDTSIPerson: NormalizedDTSIPerson
  normalizedQuorumPoliticians: NormalizedQuorumPolitician[]
  countryCode: SupportedCountryCodes
}) {
  for (const quorumPolitician of normalizedQuorumPoliticians) {
    logger.info('Checking exact match with quorumPolitician', quorumPolitician)
    if (
      quorumPolitician.firstName === normalizedDTSIPerson.firstName &&
      quorumPolitician.lastName === normalizedDTSIPerson.lastName
    ) {
      return quorumPolitician
    }

    if (
      quorumPolitician.firstName === normalizedDTSIPerson.firstNickname &&
      quorumPolitician.lastName === normalizedDTSIPerson.lastName
    ) {
      return quorumPolitician
    }

    const dtsiPersonFullName = `${normalizedDTSIPerson.firstName} ${normalizedDTSIPerson.lastName}`
    const dtsiPersonFullNameWithNickname = `${normalizedDTSIPerson.firstNickname} ${normalizedDTSIPerson.lastName}`

    const quorumPersonFullName = `${quorumPolitician.firstName} ${quorumPolitician.lastName}`

    if (dtsiPersonFullName === quorumPersonFullName) {
      return quorumPolitician
    }

    if (dtsiPersonFullNameWithNickname === quorumPersonFullName) {
      return quorumPolitician
    }

    if (quorumPolitician.middleName.length > 0) {
      const quorumPersonFullNameWithMiddleName = `${quorumPolitician.firstName} ${quorumPolitician.middleName} ${quorumPolitician.lastName}`

      if (dtsiPersonFullName === quorumPersonFullNameWithMiddleName) {
        return quorumPolitician
      }

      if (dtsiPersonFullNameWithNickname === quorumPersonFullNameWithMiddleName) {
        return quorumPolitician
      }
    }

    if (
      countryCode === SupportedCountryCodes.US &&
      normalizedDTSIPerson.electoralZone &&
      normalizedDTSIPerson.state
    ) {
      // US politicians in Quorum have a property called name, which includes the state and district in the format: John Smith (R-NY-1)
      const dtsiDistrictMatchingString = `${normalizedDTSIPerson.state}-${normalizedDTSIPerson.electoralZone}`

      if (quorumPolitician.nameAndTitle.includes(dtsiDistrictMatchingString)) {
        return quorumPolitician
      }
    }
  }
}

/**
 * Finds possible matches between a DTSI person and Quorum politicians when no exact match is found.
 *
 * A "possible match" is determined by:
 * 1. Shared last name components (handles hyphenated names like "Smith-Jones")
 * 2. Filtering by electoral zone/district (except for US where Quorum data is inconsistent)
 * 3. State-level filtering
 *
 * Returns a single match if:
 * - Only one candidate remains after filtering
 * - Multiple candidates exist but all have identical first, middle name and last names (likely duplicates)
 *
 * Otherwise returns no match.
 */
function findPossibleMatch({
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
      const possibleMatch = possibleMatches[0]

      if (
        possibleMatches.every(quorumPolitician => {
          return (
            quorumPolitician.firstName === possibleMatch.firstName &&
            quorumPolitician.lastName === possibleMatch.lastName &&
            quorumPolitician.middleName === possibleMatch.middleName
          )
        })
      ) {
        return possibleMatch
      }
    }
  }

  const dtsiPersonLastNames = normalizedDTSIPerson.lastName.replace(/-/g, ' ').split(' ')

  const possibleMatches = []

  for (const quorumPolitician of normalizedQuorumPoliticians) {
    const quorumPoliticianLastNames = quorumPolitician.lastName.replace(/-/g, ' ').split(' ')

    if (quorumPoliticianLastNames.some(lastName => dtsiPersonLastNames.includes(lastName))) {
      possibleMatches.push(quorumPolitician)
    }
  }

  // In Quorum all US Reps have their role_state set to DC, so we can't use that to match
  if (countryCode !== SupportedCountryCodes.US) {
    const possibleMatchesByElectoralZone = possibleMatches.filter(quorumPolitician => {
      const normalizedQuorumPoliticianRegionRepresented = quorumPolitician.regionRepresented
        ? normalizeQuorumElectoralZone(quorumPolitician.regionRepresented)
        : undefined

      if (countryCode === SupportedCountryCodes.AU && normalizedDTSIPerson.state) {
        const auStateName = getAUStateNameFromStateCode(normalizedDTSIPerson.state)

        // Most of the MPs in Australia have their region represented as a string with the format: "region, state"
        const dtsiAURegionRepresented = normalizeQuorumElectoralZone(
          `${normalizedDTSIPerson.electoralZone}, ${auStateName}`,
        )

        if (
          normalizedQuorumPoliticianRegionRepresented &&
          (dtsiAURegionRepresented === normalizedQuorumPoliticianRegionRepresented ||
            normalizedQuorumPoliticianRegionRepresented ===
              normalizeQuorumElectoralZone(auStateName))
        ) {
          return true
        }
      }

      return (
        normalizedQuorumPoliticianRegionRepresented &&
        normalizedQuorumPoliticianRegionRepresented === normalizedDTSIPerson.electoralZone
      )
    })

    let possibleMatch = maybeGetPossibleMatch('electoralZone', possibleMatchesByElectoralZone)

    if (possibleMatch) {
      return possibleMatch
    }

    const possibleMatchesByState = possibleMatches.filter(
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

  const possibleMatch = maybeGetPossibleMatch('lastNames', possibleMatches)

  if (possibleMatch) {
    return possibleMatch
  }
}
