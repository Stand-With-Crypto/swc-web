import levenshtein from 'js-levenshtein'
import { deburr, toLower, trim } from 'lodash-es'

import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import {
  CandidatesWithVote,
  PresidentialDataWithVotingResponse,
} from '@/data/aggregations/decisionDesk/types'

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

  // Allow up to 2 edits for names, e.g. Sapriacone vs Sapraicone, with a threshold of 2
  const nameThreshold = 2

  const hasPassedWithName = levenshtein(normalizedDTSIName, normalizedDDHQName) <= nameThreshold
  const hasPassedWithNickname =
    levenshtein(normalizedDTSINickname, normalizedDDHQName) <= nameThreshold
  const hasPassedWithLastName =
    levenshtein(normalizedDTSILastName, normalizedDDHQLastName) <= nameThreshold

  const hasPassedWithLastNameParts = compareLastNamePartsWithLevenshtein(dtsiPerson, ddhqCandidate)

  return (
    hasPassedWithName ||
    hasPassedWithNickname ||
    hasPassedWithLastName ||
    hasPassedWithLastNameParts
  )
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
