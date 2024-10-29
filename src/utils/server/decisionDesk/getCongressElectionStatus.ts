import { CongressDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getDecisionDataFromRedis } from '@/utils/server/decisionDesk/cachedData'

interface CongressCandidate {
  firstName: string
  lastName: string
  partyName: string
  office: string
  slug: string
  elected: boolean
  state: string
  votes: number
}

interface GetCongressElectionStatusResponse {
  house: CongressCandidate[]
  senate: CongressCandidate[]
}

export async function getCongressElectionStatus(): Promise<
  GetCongressElectionStatusResponse | 'N/A'
> {
  const [senateData, houseData] = await Promise.allSettled([
    getDecisionDataFromRedis<CongressDataResponse>('SWC_ALL_SENATE_DATA'),
    getDecisionDataFromRedis<CongressDataResponse>('SWC_ALL_HOUSE_DATA'),
  ])

  const congressElectionStatus: GetCongressElectionStatusResponse = {
    house: [],
    senate: [],
  }

  if (senateData.status === 'fulfilled') {
    senateData.value?.candidatesWithVotes.forEach(currentCandidate => {
      if (currentCandidate.elected) {
        congressElectionStatus.senate.push({
          firstName: currentCandidate.firstName,
          lastName: currentCandidate.lastName,
          partyName: currentCandidate.partyName,
          office: senateData.value?.office?.officeName ?? 'N/A',
          state: currentCandidate.dtsiData?.primaryRole?.primaryState ?? 'N/A',
          slug: currentCandidate.dtsiData?.slug ?? 'N/A',
          elected: currentCandidate.elected,
          votes: currentCandidate.votes,
        })
      }
    })
  }

  return congressElectionStatus
}
