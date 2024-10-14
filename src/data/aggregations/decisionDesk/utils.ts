import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import {
  CandidatesWithVote,
  PresidentialDataWithVotingResponse,
} from '@/data/aggregations/decisionDesk/types'
import { convertToOnlyEnglishCharacters } from '@/utils/shared/convertToOnlyEnglishCharacters'

export const getPoliticianFindMatch = (
  dtsiPerson: DTSI_Candidate,
  ddhqCandidate: CandidatesWithVote | PresidentialDataWithVotingResponse['votingData'] | undefined,
) => {
  if (!ddhqCandidate) return false

  const normalizedDTSIParty = normalizeName(dtsiPerson.politicalAffiliationCategory ?? '').slice(
    0,
    8,
  ) // slicing up to 8 to match democrat with democratic
  const normalizedDDHQParty = normalizeName(ddhqCandidate.partyName ?? '').slice(0, 8) // slicing up to 8 to match democrat with democratic

  const normalizedDTSIName = normalizeName(`${dtsiPerson.firstName} ${dtsiPerson.lastName}`)
  const normalizedDTSINickname = normalizeName(`${dtsiPerson.firstNickname} ${dtsiPerson.lastName}`)
  const normalizedDDHQName = normalizeName(`${ddhqCandidate.firstName} ${ddhqCandidate.lastName}`)

  const normalizedDTSIFirstName = normalizeName(dtsiPerson.firstName)
  const normalizedDDHQFirstName = normalizeName(ddhqCandidate.firstName)
  const normalizedDTSILastName = normalizeName(dtsiPerson.lastName)
  const normalizedDDHQLastName = normalizeName(ddhqCandidate.lastName)

  if (normalizedDTSIName === normalizedDDHQName) {
    return true
  }

  if (normalizedDTSINickname === normalizedDDHQName) {
    return true
  }

  if (normalizedDDHQName.startsWith(normalizedDTSIName)) {
    return true
  }

  if (normalizedDDHQName.startsWith(normalizedDTSINickname)) {
    return true
  }

  if (normalizedDTSIName.startsWith(normalizedDDHQName)) {
    return true
  }

  if (normalizedDTSILastName === normalizedDDHQLastName) {
    return true
  }

  // if (
  //   normalizedDTSIParty === normalizedDDHQParty &&
  //   normalizedDTSIFirstName === normalizedDDHQFirstName
  // ) {
  //   return true
  // }

  return false
}

export const normalizeName = (name: string) => {
  return convertToOnlyEnglishCharacters(name.toLowerCase().trim()).replace(/[.-\s]/g, '')
}
