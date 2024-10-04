export interface VotingData {
  id: number
  firstName: string
  lastName: string
  votes: number
  percentage: number
  electoralVotes: number
  partyName: string
}

export type PresidentialDataWithVotingResponse = Array<
  DTSI_UnitedStatesPresidentialQuery['people'][0] & {
    votingData?: VotingData
  }
>
