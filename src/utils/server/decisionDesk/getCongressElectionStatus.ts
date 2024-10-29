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
  house: CongressCandidate[] | ['NOT_CALLED_YET']
  senate: CongressCandidate[] | ['NOT_CALLED_YET']
}

export async function getCongressElectionStatus(): Promise<GetCongressElectionStatusResponse> {
  const [senateData, houseData] = await Promise.allSettled([
    getDecisionDataFromRedis<CongressDataResponse>('SWC_ALL_SENATE_DATA'),
    getDecisionDataFromRedis<CongressDataResponse>('SWC_ALL_HOUSE_DATA'),
  ])

  const congressElectionStatus = {
    house: [] as CongressCandidate[],
    senate: [] as CongressCandidate[],
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

  return {
    house:
      congressElectionStatus.house.length > 0 ? congressElectionStatus.house : ['NOT_CALLED_YET'],
    senate:
      congressElectionStatus.senate.length > 0 ? congressElectionStatus.senate : ['NOT_CALLED_YET'],
  }
}
