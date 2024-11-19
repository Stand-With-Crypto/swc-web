import levenshtein from 'js-levenshtein'
import { deburr, toLower, trim } from 'lodash-es'

import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { CandidatesWithVote } from '@/data/aggregations/decisionDesk/types'

export const getDdhqMatchFromDtsi = (
  ddhqCandidates: CandidatesWithVote | CandidatesWithVote[],
  dtsiCandidate: DTSI_Candidate,
) => {
  const currentDdhqCandidates = Array.isArray(ddhqCandidates) ? ddhqCandidates : [ddhqCandidates]

  if (!dtsiCandidate) return
  if (!currentDdhqCandidates || currentDdhqCandidates.length === 0) return

  return currentDdhqCandidates.find(ddhqCandidate => {
    const hasStateAndDistrictMatching = checkStateAndDistrict(ddhqCandidate, dtsiCandidate)

    if (!hasStateAndDistrictMatching) {
      return false
    }

    const hasNameDirectMatching = checkDirectNameMatching(ddhqCandidate, dtsiCandidate)
    const hasLevenshtein = checkLevenshteinNameMatching(ddhqCandidate, dtsiCandidate)

    return hasNameDirectMatching || hasLevenshtein
  })
}

export const getDtsiMatchFromDdhq = (
  ddhqCandidate: CandidatesWithVote,
  dtsiPeople: DTSI_Candidate[] | DTSI_Candidate,
) => {
  const currentDtsiPeople = Array.isArray(dtsiPeople) ? dtsiPeople : [dtsiPeople]

  if (!currentDtsiPeople || currentDtsiPeople.length === 0) return

  return currentDtsiPeople.find(dtsiPerson => {
    const hasStateAndDistrictMatching = checkStateAndDistrict(ddhqCandidate, dtsiPerson)

    if (!hasStateAndDistrictMatching) {
      return false
    }

    const hasNameDirectMatching = checkDirectNameMatching(ddhqCandidate, dtsiPerson)
    const hasLevenshtein = checkLevenshteinNameMatching(ddhqCandidate, dtsiPerson)

    return hasNameDirectMatching || hasLevenshtein
  })
}

export const checkStateAndDistrict = (
  ddhqCandidate: CandidatesWithVote,
  dtsiPerson: DTSI_Candidate,
) => {
  if (!ddhqCandidate) return false

  // if there's no state and district in ddhqCandidate, return true for it is presidency
  if (ddhqCandidate && !('state' in ddhqCandidate) && !('district' in ddhqCandidate)) {
    return true
  }

  const ddhqCandidateState = ddhqCandidate.state
  const ddhqCandidateDistrict = ddhqCandidate.district
  const ddhqRaceType = ddhqCandidateDistrict ? 'HOUSE' : 'SENATE'

  const dtsiCandidateState = dtsiPerson.primaryRole?.primaryState

  const isRunningSameState = toLower(ddhqCandidateState) === toLower(dtsiCandidateState)

  if (isRunningSameState && ddhqRaceType === 'SENATE') {
    return true
  }

  const dtsiCandidateDistrict = dtsiPerson.primaryRole?.primaryDistrict
  const isRunningSameDistrict = toLower(ddhqCandidateDistrict) === toLower(dtsiCandidateDistrict)

  if (isRunningSameState && isRunningSameDistrict && ddhqRaceType === 'HOUSE') {
    return true
  }

  return false
}

export const checkDirectNameMatching = (
  ddhqCandidate: CandidatesWithVote,
  dtsiPerson: DTSI_Candidate,
) => {
  const ddhqFirstName = ddhqCandidate.firstName
  const ddhqLastName = ddhqCandidate.lastName

  const dtsiFirstName = dtsiPerson.firstName
  const dtsiLastName = dtsiPerson.lastName
  const dtsiNickName = dtsiPerson.firstNickname
  const dtsiNameSuffix = dtsiPerson.nameSuffix

  const normalizedDdhqFirstName = normalizeName(ddhqFirstName)
  const normalizedDdhqLastName = normalizeName(ddhqLastName)

  const normalizedDtsiFirstName = normalizeName(dtsiFirstName)
  const normalizedDtsiLastName = normalizeName(dtsiLastName)
  const normalizedDtsiNickName = normalizeName(dtsiNickName)
  const normalizedDtsiSuffix = normalizeName(dtsiNameSuffix)

  const hasFirstNameMatch =
    ddhqFirstName === dtsiFirstName || normalizedDdhqFirstName === normalizedDtsiFirstName
  const hasNickNameMatch =
    dtsiNickName === ddhqFirstName || normalizedDtsiNickName === normalizedDdhqFirstName
  const hasLastNameMatch =
    ddhqLastName === dtsiLastName || normalizedDdhqLastName === normalizedDtsiLastName

  // checks for firstName and lastName match
  if (hasFirstNameMatch && hasLastNameMatch) {
    return true
  }

  // checks for nickName, firstName and lastName match
  if (hasNickNameMatch && hasLastNameMatch) {
    return true
  }

  // checks for firstName, lastName and suffix match
  if (dtsiNameSuffix) {
    const dtsiNameWithoutSuffix = `${dtsiFirstName} ${dtsiLastName}`
    const dtsiNameWithSuffix = `${dtsiNameWithoutSuffix.replace(dtsiNameSuffix, '')} ${dtsiNameSuffix}`
    const ddhqName = `${ddhqFirstName} ${ddhqLastName}`

    if (dtsiNameWithSuffix === ddhqName) {
      return true
    }
  }

  // checks for normalized complete name and suffix match
  if (normalizedDtsiSuffix) {
    const normalizedDtsiNameWithoutSuffix = `${normalizedDtsiFirstName}${normalizedDtsiLastName}`
    const normalizedDtsiNameWithSuffix = `${normalizedDtsiNameWithoutSuffix.replace(
      normalizedDtsiSuffix,
      '',
    )}${normalizedDtsiSuffix}`
    const normalizedDdhqName = `${normalizedDdhqFirstName}${normalizedDdhqLastName}`

    if (normalizedDdhqName === normalizedDtsiNameWithSuffix) {
      return true
    }
  }

  // checks for names split between '-' or ' '
  const ddhqFirstNameParts = ddhqFirstName.split(/[\s-]/)
  const ddhqLastNameParts = ddhqLastName.split(/[\s-]/)

  const dtsiFirstNameParts = dtsiFirstName.split(/[\s-]/)
  const dtsiLastNameParts = dtsiLastName.split(/[\s-]/)

  const isFirstNamePartsMatching = ddhqFirstNameParts.some(ddhqPart => {
    return dtsiFirstNameParts.some(dtsiPart => {
      return ddhqPart === dtsiPart
    })
  })

  const isFirstNamePartsMatchingNormalized = ddhqFirstNameParts.some(ddhqPart => {
    return dtsiFirstNameParts.some(dtsiPart => {
      return normalizeName(ddhqPart) === normalizeName(dtsiPart)
    })
  })

  const isLastNamePartsMatching = ddhqLastNameParts.some(ddhqPart => {
    return dtsiLastNameParts.some(dtsiPart => {
      return ddhqPart === dtsiPart
    })
  })

  const isLastNamePartsMatchingNormalized = ddhqLastNameParts.some(ddhqPart => {
    return dtsiLastNameParts.some(dtsiPart => {
      return normalizeName(ddhqPart) === normalizeName(dtsiPart)
    })
  })

  const hasFirstNamePartsMatch = isFirstNamePartsMatching || isFirstNamePartsMatchingNormalized
  const hasLastNamePartsMatch = isLastNamePartsMatching || isLastNamePartsMatchingNormalized

  if (hasFirstNamePartsMatch && hasLastNamePartsMatch) {
    return true
  }

  return false
}

export const checkLevenshteinNameMatching = (
  ddhqCandidate: CandidatesWithVote,
  dtsiPerson: DTSI_Candidate,
) => {
  const normalizedDdhqFirstName = normalizeName(ddhqCandidate.firstName)
  const normalizedDdhqLastName = normalizeName(ddhqCandidate.lastName)

  const normalizedDtsiFirstName = normalizeName(dtsiPerson.firstName)
  const normalizedDtsiLastName = normalizeName(dtsiPerson.lastName)
  const normalizedDtsiNickName = normalizeName(dtsiPerson.firstNickname)
  const normalizedDtsiSuffix = normalizeName(dtsiPerson.nameSuffix)

  const hasFirstNameLevenshteinMatch =
    levenshtein(normalizedDdhqFirstName, normalizedDtsiFirstName) <= 2
  const hasLastNameLevenshteinMatch =
    levenshtein(normalizedDdhqLastName, normalizedDtsiLastName) <= 2

  if (hasFirstNameLevenshteinMatch && hasLastNameLevenshteinMatch) {
    return true
  }

  const hasNickNameLevenshteinMatch =
    levenshtein(normalizedDdhqFirstName, normalizedDtsiNickName) <= 2

  if (hasNickNameLevenshteinMatch && hasLastNameLevenshteinMatch) {
    return true
  }

  if (normalizedDtsiSuffix) {
    const normalizedDtsiNameWithoutSuffix = `${normalizedDtsiFirstName}${normalizedDtsiLastName}`
    const normalizedDtsiNameWithSuffix = `${normalizedDtsiNameWithoutSuffix.replace(
      normalizedDtsiSuffix,
      '',
    )}${normalizedDtsiSuffix}`
    const normalizedDdhqName = `${normalizedDdhqFirstName}${normalizedDdhqLastName}`

    const hasNameWithSuffixLevenshteinMatch =
      levenshtein(normalizedDdhqName, normalizedDtsiNameWithSuffix) <= 2

    if (hasNameWithSuffixLevenshteinMatch) {
      return true
    }
  }

  return false
}

export const normalizeName = (name: string) => {
  return deburr(toLower(trim(name))).replace(/[.-\s]/g, '')
}
