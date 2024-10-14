import * as Sentry from '@sentry/node'

import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { getPoliticianFindMatch } from '@/data/aggregations/decisionDesk/utils'
import { queryDTSILocationUnitedStatesPresidential } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesPresidentialInformation'
import { fetchElectoralCollege } from '@/utils/server/decisionDesk/services'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('aggregations/decisionDesk/getDtsiPresidentialWithVotingData')

async function getPresidentialData(year = '2024') {
  const { candidates } = await fetchElectoralCollege(year)

  if (!candidates) {
    return []
  }

  return candidates.map(currentCandidate => {
    return {
      id: currentCandidate.cand_id,
      firstName: currentCandidate.first_name,
      lastName: currentCandidate.last_name,
      votes: currentCandidate.votes,
      percentage: currentCandidate.percentage,
      electoralVotes: currentCandidate.electoral_votes_total,
      partyName: currentCandidate.party_name,
      called: currentCandidate.called,
    }
  })
}

export async function getDtsiPresidentialWithVotingData(
  year = '2024',
): Promise<PresidentialDataWithVotingResponse[]> {
  const presidentialData = await getPresidentialData(year)
  const dtsiData = await queryDTSILocationUnitedStatesPresidential()

  const presidentialVoteData = dtsiData.people.map(currentPolitician => {
    const votingData = presidentialData.find(currentVotingData => {
      return getPoliticianFindMatch(currentPolitician, currentVotingData)
    })

    return {
      ...currentPolitician,
      votingData,
    }
  })

  const notFoundVotingData = presidentialVoteData.filter(
    currentVoteData => !currentVoteData.votingData,
  )

  if (notFoundVotingData.length > 0) {
    const candidateNames = notFoundVotingData.map(
      currentCandidate => `${currentCandidate.firstName} ${currentCandidate.lastName}`,
    )

    logger.info('No match for candidates between decisionDesk and DTSI.', {
      domain: 'aggregations/decisionDesk/getDtsiPresidentialWithVotingData',
      candidateNames,
    })

    Sentry.captureMessage('No match for candidates between decisionDesk and DTSI.', {
      extra: {
        domain: 'aggregations/decisionDesk/getDtsiPresidentialWithVotingData',
        candidateNames,
      },
    })
  }

  return presidentialVoteData
}
