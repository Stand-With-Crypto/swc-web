import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'

interface ElectedData {
  firstName: string
  lastName: string
  slug: string
  party?: string
  votes?: number
  elected: boolean
  percentage?: number
  electoralVotes?: number
}

interface GetPresidentialElectionStatusResponse {
  presidentElected: ElectedData | 'NOT_CALLED_YET'
}

export async function getPresidentialElectionStatus(): Promise<GetPresidentialElectionStatusResponse> {
  const presidentialData = await getDecisionDataFromRedis<PresidentialDataWithVotingResponse[]>(
    'SWC_PRESIDENTIAL_RACES_DATA',
  )

  const currentPresidentElected = presidentialData?.find(
    presidentialRace => presidentialRace.votingData?.called,
  )

  if (!currentPresidentElected) {
    return {
      presidentElected: 'NOT_CALLED_YET',
    }
  }

  return {
    presidentElected: {
      firstName: currentPresidentElected.firstName,
      lastName: currentPresidentElected.lastName,
      slug: currentPresidentElected.slug,
      party: currentPresidentElected.votingData?.partyName,
      votes: currentPresidentElected.votingData?.votes,
      elected: currentPresidentElected.votingData?.called ?? false,
      percentage: currentPresidentElected.votingData?.percentage,
      electoralVotes: currentPresidentElected.votingData?.electoralVotes,
    },
  }
}
