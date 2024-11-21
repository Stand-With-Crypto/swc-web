import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { ELECTION_TYPES, OFFICES } from '@/utils/server/decisionDesk/constants'
import { GetRacesParams } from '@/utils/server/decisionDesk/schemas'
import { fetchRacesData } from '@/utils/server/decisionDesk/services'

export async function getAllRacesData(params: GetRacesParams): Promise<RacesVotingDataResponse[]> {
  const { data: firstPageData, total_pages } = await fetchRacesData({
    page: '1',
    limit: '250',
    ...params,
  })

  const pageIteration = Array.from({ length: total_pages - 1 }, (_, i) => (i + 2).toString())

  const allData = await Promise.all(
    pageIteration.map(async currentPage => {
      const response = await fetchRacesData({ ...params, page: currentPage })
      return response?.data ?? []
    }),
  ).catch(error => {
    return Promise.reject(error)
  })

  const aggregatedData = [...firstPageData, ...allData.flat()]

  const mappedAggregatedData = aggregatedData.map(currentData => {
    const calledCandidate =
      currentData.candidates.find(
        candidate => candidate.cand_id === currentData.topline_results.called_candidates?.[0],
      ) || null

    return {
      state: currentData.state,
      stateName: currentData.state_name,
      district: currentData.district,
      office:
        OFFICES.find(currentOffice => +currentOffice.officeId === currentData.office_id) ?? null,
      electionType:
        ELECTION_TYPES.find(
          currentElection => +currentElection.electionTypeId === currentData.election_type_id,
        ) ?? null,
      year: currentData.year,
      partyName: currentData.party,
      totalVotes: currentData.topline_results.total_votes,
      raceDate: currentData.race_date,
      lastUpdated: currentData.last_updated,
      calledCandidate: calledCandidate
        ? {
            id: calledCandidate?.cand_id ?? 0,
            firstName: calledCandidate?.first_name ?? '',
            lastName: calledCandidate?.last_name ?? '',
            partyName: calledCandidate?.party_name ?? '',
            incumbent: calledCandidate?.incumbent ?? false,
            state: currentData.state,
            stateName: currentData.state_name,
            district: currentData.district,
          }
        : null,
      hasCalledCandidate: !!calledCandidate,
      calledCandidates: currentData.candidates
        .map(candidate => {
          const hasBeenCalled = currentData.topline_results.called_candidates.includes(
            candidate.cand_id,
          )

          if (!hasBeenCalled) {
            return null
          }

          return {
            id: candidate.cand_id,
            firstName: candidate.first_name,
            lastName: candidate.last_name,
            partyName: candidate.party_name,
            state: currentData.state,
            stateName: currentData.state_name,
            district: currentData.district,
          }
        })
        .filter(Boolean),
      advanceCandidates: currentData.advance_candidates === 'true',
      advancingCandidates: currentData.topline_results.advancing_candidates
        .map(currentAdvancingCandidateId => {
          const advancingCandidate = currentData.candidates.find(
            candidate => candidate.cand_id === currentAdvancingCandidateId,
          )

          if (!advancingCandidate) {
            return null
          }

          return {
            id: advancingCandidate.cand_id,
            firstName: advancingCandidate.first_name,
            lastName: advancingCandidate.last_name,
            partyName: advancingCandidate.party_name,
            state: currentData.state,
            stateName: currentData.state_name,
            district: currentData.district,
          }
        })
        .filter(Boolean),
      candidatesWithVotes: currentData.candidates.map(candidate => ({
        id: candidate.cand_id,
        firstName: candidate.first_name,
        lastName: candidate.last_name,
        partyName: candidate.party_name,
        elected: currentData.topline_results.called_candidates.includes(candidate.cand_id),
        estimatedVotes: {
          estimatedVotesLow: currentData.topline_results.estimated_votes.estimated_votes_low,
          turnoutLow: currentData.topline_results.estimated_votes.turnout_low,
          estimatedVotesMid: currentData.topline_results.estimated_votes.estimated_votes_mid,
          turnoutMid: currentData.topline_results.estimated_votes.turnout_mid,
          estimatedVotesHigh: currentData.topline_results.estimated_votes.estimated_votes_high,
          turnoutHigh: currentData.topline_results.estimated_votes.turnout_high,
        },
        votes:
          currentData.topline_results.votes[candidate.cand_id] ||
          currentData.topline_results.voting_data[candidate.cand_id]?.election_day_votes ||
          0,
        state: currentData.state,
        stateName: currentData.state_name,
        district: currentData.district,
      })),
    }
  })

  return mappedAggregatedData
}
