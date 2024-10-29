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

export async function getPresidentialElectionStatus(): Promise<ElectedData | 'N/A'> {
  const presidentialData = await getDecisionDataFromRedis<PresidentialDataWithVotingResponse[]>(
    'SWC_PRESIDENTIAL_RACES_DATA',
  )

  const currentPresidentElected = presidentialData?.find(
    presidentialRace => !presidentialRace.votingData?.called,
  )

  if (!currentPresidentElected) {
    return 'N/A'
  }

  return {
    firstName: currentPresidentElected.firstName,
    lastName: currentPresidentElected.lastName,
    slug: currentPresidentElected.slug,
    party: currentPresidentElected.votingData?.partyName,
    votes: currentPresidentElected.votingData?.votes,
    elected: currentPresidentElected.votingData?.called ?? false,
    percentage: currentPresidentElected.votingData?.percentage,
    electoralVotes: currentPresidentElected.votingData?.electoralVotes,
  }
}
