import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { ELECTION_TYPES, OFFICES } from '@/utils/server/decisionDesk/constants'
import { GetRacesParams } from '@/utils/server/decisionDesk/schemas'
import { fetchRacesData } from '@/utils/server/decisionDesk/services'

export async function getAllRacesData(params: GetRacesParams): Promise<RacesVotingDataResponse[]> {
  const { data: firstPageData, total_pages } = await fetchRacesData({
    ...params,
    page: '1',
    limit: '100',
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
      party: currentData.party,
      totalVotes: currentData.topline_results.total_votes,
      candidatesWithVotes: currentData.candidates.map(candidate => ({
        id: candidate.cand_id,
        firstName: candidate.first_name,
        lastName: candidate.last_name,
        party: candidate.party_name,
        votes:
          currentData.topline_results.voting_data[candidate.cand_id]?.election_day_votes ??
          currentData.topline_results.votes[candidate.cand_id] ??
          0,
      })),
    }
  })

  return mappedAggregatedData
}