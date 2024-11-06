import levenshtein from 'js-levenshtein'
import { deburr, toLower, trim } from 'lodash-es'

import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import {
  CandidatesWithVote,
  PresidentialDataWithVotingResponse,
} from '@/data/aggregations/decisionDesk/types'

const HARD_CODED_LASTNAMES = ['boebert', 'banks', 'slotkin', 'kim', 'allred', 'curtis', 'gallego']

export const getPoliticianFindMatch = (
  dtsiPerson: DTSI_Candidate,
  ddhqCandidate: CandidatesWithVote | PresidentialDataWithVotingResponse['votingData'] | undefined,
) => {
  if (!ddhqCandidate) return false
  if (!dtsiPerson) return false

  const normalizedDTSIName = normalizeName(`${dtsiPerson.firstName} ${dtsiPerson.lastName}`)
  const normalizedDTSINickname = normalizeName(`${dtsiPerson.firstNickname} ${dtsiPerson.lastName}`)
  const normalizedDTSILastName = normalizeName(dtsiPerson.lastName)

  const normalizedDDHQName = normalizeName(`${ddhqCandidate.firstName} ${ddhqCandidate.lastName}`)
  const normalizedDDHQLastName = normalizeName(ddhqCandidate.lastName)

  if (
    HARD_CODED_LASTNAMES.includes(normalizedDTSILastName) &&
    normalizedDTSILastName === normalizedDDHQLastName
  ) {
    return true
  }

  const decisionDeskDistrict = 'district' in ddhqCandidate ? (ddhqCandidate.district ?? '') : ''
  if (
    (dtsiPerson.primaryRole?.primaryDistrict?.toLowerCase() ?? '') !==
    decisionDeskDistrict?.toLowerCase()
  ) {
    return false
  }

  // Allow up to 2 edits for names, e.g. Sapriacone vs Sapraicone, with a threshold of 2
  const nameThreshold = 2

  const hasPassedWithName = levenshtein(normalizedDTSIName, normalizedDDHQName) <= nameThreshold
  const hasPassedWithNickname =
    levenshtein(normalizedDTSINickname, normalizedDDHQName) <= nameThreshold
  const hasPassedWithLastName =
    levenshtein(normalizedDTSILastName, normalizedDDHQLastName) <= nameThreshold

  const hasPassedWithLastNameParts = compareLastNamePartsWithLevenshtein(dtsiPerson, ddhqCandidate)

  let isMatch =
    hasPassedWithName ||
    hasPassedWithNickname ||
    hasPassedWithLastName ||
    hasPassedWithLastNameParts

  if ('state' in ddhqCandidate) {
    isMatch =
      isMatch &&
      dtsiPerson.primaryRole?.primaryState?.toLowerCase() === ddhqCandidate.state.toLowerCase()
  }

  return isMatch
}

export const normalizeName = (name: string) => {
  return deburr(toLower(trim(name))).replace(/[.-\s]/g, '')
}

function compareLastNamePartsWithLevenshtein(
  dtsiPerson: DTSI_Candidate,
  ddhqCandidate: CandidatesWithVote | PresidentialDataWithVotingResponse['votingData'],
) {
  const dtsiFirstName = dtsiPerson.firstName
  const dtsiLastName = dtsiPerson.lastName

  const ddhqFirstName = ddhqCandidate!.firstName
  const ddhqLastName = ddhqCandidate!.lastName

  const dtsiLastNameParts = dtsiLastName.split(' ').map(part => normalizeName(part))
  const ddhqLastNameParts = ddhqLastName.split(' ').map(part => normalizeName(part))

  const levenshteinThreshold = 2

  const hasPassedFirstName = levenshtein(dtsiFirstName, ddhqFirstName) <= levenshteinThreshold
  const hasPassedLastName = dtsiLastNameParts.some(dtsiPart =>
    ddhqLastNameParts.some(ddhqPart => levenshtein(dtsiPart, ddhqPart) <= levenshteinThreshold),
  )

  return hasPassedFirstName && hasPassedLastName
}
