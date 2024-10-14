import { DTSI_AllPeopleQuery, DTSI_UnitedStatesPresidentialQuery } from '@/data/dtsi/generated'
import { ELECTION_TYPES, OFFICES } from '@/utils/server/decisionDesk/constants'
import { Candidate } from '@/utils/server/decisionDesk/types'

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
  candidatesWithVotes: CandidatesWithVote[]
}

export interface CongressDataResponse {
  office: (typeof OFFICES)[0] | null
  year: number
  candidatesWithVotes: CandidatesWithVote[]
}

export interface CandidatesWithVote {
  id: number
  firstName: string
  lastName: string
  partyName: string
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
  senateDataWithDtsi: Omit<CongressDataResponse, 'candidatesWithVotes'> & {
    candidatesWithVotes: (CandidatesWithVote & {
      dtsiData: DTSI_AllPeopleQuery['people'][number] | null
    })[]
  }
  houseDataWithDtsi: Omit<CongressDataResponse, 'candidatesWithVotes'> & {
    candidatesWithVotes: (CandidatesWithVote & {
      dtsiData: DTSI_AllPeopleQuery['people'][number] | null
    })[]
  }
}
