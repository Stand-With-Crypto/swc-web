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
  const normalizedDTSILastNameFirstPart = normalizeName(getLastNameFirstPart(dtsiPerson.lastName))

  const normalizedDDHQName = normalizeName(`${ddhqCandidate.firstName} ${ddhqCandidate.lastName}`)
  const normalizedDDHQLastName = normalizeName(ddhqCandidate.lastName)
  const normalizedDDHQLastNameFirstPart = normalizeName(
    getLastNameFirstPart(ddhqCandidate.lastName),
  )

  // Allow up to 2 edits for names, e.g. Sapriacone vs Sapraicone, with a threshold of 2
  const nameThreshold = 2

  const hasPassedWithName = levenshtein(normalizedDTSIName, normalizedDDHQName) <= nameThreshold
  const hasPassedWithNickname =
    levenshtein(normalizedDTSINickname, normalizedDDHQName) <= nameThreshold
  const hasPassedWithLastName =
    levenshtein(normalizedDTSILastName, normalizedDDHQLastName) <= nameThreshold
  const hasPassedWithLastNameFirstPart =
    levenshtein(normalizedDTSILastNameFirstPart, normalizedDDHQLastNameFirstPart) <= nameThreshold

  return (
    hasPassedWithName ||
    hasPassedWithNickname ||
    hasPassedWithLastName ||
    hasPassedWithLastNameFirstPart
  )
}

export const normalizeName = (name: string) => {
  return deburr(toLower(trim(name))).replace(/[.-\s]/g, '')
}

export const getLastNameFirstPart = (lastName: string) => {
  return lastName.split(' ')[0]
}
