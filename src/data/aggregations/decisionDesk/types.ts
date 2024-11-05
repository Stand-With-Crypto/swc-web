import { DTSI_AllPeopleQuery, DTSI_UnitedStatesPresidentialQuery } from '@/data/dtsi/generated'
import { ELECTION_TYPES, OFFICES } from '@/utils/server/decisionDesk/constants'

export interface Candidate {
  id: number
  firstName: string
  lastName: string
  partyName: string
  incumbent?: boolean
  state: string
  stateName: string
  district: string
}
export interface RacesVotingDataResponse {
  state: string
  stateName: string
  district: string
  office: (typeof OFFICES)[0] | null
  electionType: (typeof ELECTION_TYPES)[0] | null
  year: number
  partyName: string | null
  totalVotes: number
  raceDate: string
  lastUpdated: string
  calledCandidate: Candidate | null
  calledCandidates: Candidate[]
  candidatesWithVotes: CandidatesWithVote[]
  hasCalledCandidate: boolean
  advanceCandidates: boolean
  advancingCandidates: Candidate[]
}

export interface CongressDataResponse {
  office: (typeof OFFICES)[0] | null
  year: number
  candidatesWithVotes: (CandidatesWithVote & {
    dtsiData?: DTSI_AllPeopleQuery['people'][number] | null
  })[]
}

export interface CandidatesWithVote extends Candidate {
  votes: number
  elected: boolean
  estimatedVotes: {
    estimatedVotesLow: number
    turnoutLow: number
    estimatedVotesMid: number
    turnoutMid: number
    estimatedVotesHigh: number
    turnoutHigh: number
  }
}

interface VotingData {
  id: number
  firstName: string
  lastName: string
  votes: number
  percentage: number
  electoralVotes: number
  partyName: string
  called: boolean
}

export type PresidentialDataWithVotingResponse = DTSI_UnitedStatesPresidentialQuery['people'][0] & {
  votingData?: VotingData
}

export interface GetAllCongressDataProps {
  houseData: RacesVotingDataResponse[]
  senateData: RacesVotingDataResponse[]
}

export interface GetAllCongressDataResponse {
  senateDataWithDtsi: CongressDataResponse | null
  houseDataWithDtsi: CongressDataResponse | null
}
