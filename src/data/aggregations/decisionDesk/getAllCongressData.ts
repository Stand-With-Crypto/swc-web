import * as Sentry from '@sentry/node'

import {
  CongressDataResponse,
  GetAllCongressDataProps,
  GetAllCongressDataResponse,
  RacesVotingDataResponse,
} from '@/data/aggregations/decisionDesk/types'
import { getPoliticianFindMatch } from '@/data/aggregations/decisionDesk/utils'
import { DTSI_AllPeopleQuery } from '@/data/dtsi/generated'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('aggregations/decisionDesk/getAllCongressData')

const reduceCongressData = (congressData: RacesVotingDataResponse[]) => {
  const candidatesWithVoteFlatMap = congressData.flatMap(
    currentData => currentData.candidatesWithVotes,
  )
  return {
    office: congressData[0].office,
    year: congressData[0].year,
    candidatesWithVotes: candidatesWithVoteFlatMap.map(currentCandidate => {
      const candidateVotes = candidatesWithVoteFlatMap.filter(
        candidate => candidate.id === currentCandidate.id,
      )
      const totalVotes = candidateVotes.reduce((acc, current) => acc + current.votes, 0)
      return {
        ...currentCandidate,
        votes: totalVotes,
      }
    }),
  }
}

const enhanceCongressData = (
  congressData: CongressDataResponse,
  dtsiAllPeopleData: DTSI_AllPeopleQuery,
) => {
  const { people } = dtsiAllPeopleData

  const enhancedCandidatesWithVote = congressData.candidatesWithVotes.map(currentCandidate => {
    const dtsiData =
      people.find(currentPerson => {
        return getPoliticianFindMatch(currentPerson, currentCandidate)
      }) ?? null

    if (!dtsiData) {
      logger.info('No match for candidates between decisionDesk and DTSI.', {
        tags: { domain: 'liveResult' },
        candidateName: `${currentCandidate.firstName} ${currentCandidate.lastName}`,
      })

      Sentry.captureMessage('No match for candidates between decisionDesk and DTSI.', {
        tags: { domain: 'liveResult' },
        extra: {
          candidateName: `${currentCandidate.firstName} ${currentCandidate.lastName}`,
        },
      })
    }

    return {
      ...currentCandidate,
      dtsiData,
    }
  })

  return {
    ...congressData,
    candidatesWithVotes: enhancedCandidatesWithVote,
  }
}

export async function getAllCongressData({
  houseData,
  senateData,
}: GetAllCongressDataProps): Promise<GetAllCongressDataResponse> {
  const dtsiAllPeopleData = await queryDTSIAllPeople()

  const allSenateData = reduceCongressData(senateData)
  const allHouseData = reduceCongressData(houseData)

  const senateDataWithDtsi = enhanceCongressData(allSenateData, dtsiAllPeopleData)
  const houseDataWithDtsi = enhanceCongressData(allHouseData, dtsiAllPeopleData)

  return { senateDataWithDtsi, houseDataWithDtsi }
}
