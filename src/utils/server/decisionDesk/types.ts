/**
 * Decision Desk API bearer token response.
 * Provides a Bearer Token with an expiration time of 8 hours
 * @docs https://results-api-docs.decisiondeskhq.com/reference/post_auth
 */
export interface GetBearerTokenResponse {
  access_token: string
  created_at: number
  expires_in: number
  scope: string
  token_type: string
}

/**
 * Decision Desk API races response.
 * @docs https://results-api-docs.decisiondeskhq.com/reference/get_racesfetch
 */
export interface GetRacesResponse {
  total: number
  page: number
  total_pages: number
  limit: number
  next_page_url: string
  data: RacesData[]
  md5: string
  sha256: string
}

export interface RacesData {
  race_id: number
  test_data: boolean
  year: number
  state_fips: string
  state_name: string
  state: string
  ecvotes: any
  election_type_id: number
  name: string
  race_date: string
  office_id: number
  office: string
  district: any
  party_id: number
  party: string
  level: string
  advance_candidates: 'true' | 'false'
  expected_winners: number
  uncontested: boolean
  last_updated: string
  race_created: string
  poll_close_time: string
  marquee_race: string
  abev_expected: string
  reporting_type: string
  topline_results: ToplineResults
  counties: County[]
  candidates: Candidate[]
}

export interface ToplineResults {
  votes: Votes
  total_votes: number
  voting_data: VotingData
  estimated_votes: EstimatedVotes
  precincts: Precincts
  called_candidates: number[]
  call_times: CallTime[]
  advancing_candidates: number[]
  // TODO: Check if this is correct
  advance_times: {
    [key: string]: number | string
  }[]
}

export interface Votes {
  [key: string]: number | undefined
}

export interface VotingData {
  [key: string]: VotingMetrics | undefined
}

export interface CandidateResults {
  [key: string]: number | undefined
}

export interface VotingMetrics {
  absentee_ballots_early_votes: number
  election_day_votes: number
}

export interface EstimatedVotes {
  estimated_votes_low: number
  turnout_low: number
  estimated_votes_mid: number
  turnout_mid: number
  estimated_votes_high: number
  turnout_high: number
}

export interface Precincts {
  total: number
  reporting: number
}

export interface CallTime {
  cand_id: number
  called_time: string
}

export interface Candidate {
  cand_id: number
  party_name: string
  party_id: number
  first_name: string
  last_name: string
  incumbent: boolean
}

export interface County {
  id: number
  county: string
  fips: string
  estimated_votes: EstimatedVotes
  precincts: Precincts
  votes: Votes
  voting_data: VotingData
  vcus: Vcu[]
}

export interface Vcu {
  id: number
  vcu: string
  fips: string
  estimated_votes: EstimatedVotes
  precincts: Precincts
  votes: Votes
  voting_data: VotingData
}

export interface GetDelegatesResponse {
  delegates: Delegate[]
  candidates: Candidate[]
}

export interface Delegate {
  party_id: number
  name: string
  total: number
  national: CandidateResults
  states: State[]
}

export interface State {
  state_fips: string
  state: string
  total: number
  state_name: string
  candidates: CandidateResults
}

export interface GetElectoralCollegeResponse {
  candidates: ElectoralCandidate[]
  states: ElectoralState[]
}

export interface ElectoralCandidate {
  cand_id: number
  party_name: string
  party_id: number
  first_name: string
  last_name: string
  incumbent: boolean
  votes: number
  percentage: number
  called: boolean
  electoral_votes_total: number
}

export interface ElectoralState {
  state_fips: string
  state_name: string
  electoral_college_votes: number
  called: boolean
  called_candidate: any
}
