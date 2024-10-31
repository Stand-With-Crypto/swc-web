import * as Sentry from '@sentry/node'

import {
  CandidatesWithVote,
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

const reduceCongressData = (congressData: RacesVotingDataResponse[]) =>
  congressData.reduce(
    (acc, currentData) => ({
      office: currentData.office,
      year: currentData.year,
      candidatesWithVotes: [
        ...acc.candidatesWithVotes,
        ...currentData.candidatesWithVotes.reduce((innerAcc, currentCandidate) => {
          const existingCandidate = innerAcc.find(
            currentInnerAcc => currentInnerAcc.id === currentCandidate.id,
          )

          return existingCandidate
            ? innerAcc.map(currentInnerAcc =>
                currentInnerAcc.id === currentCandidate.id
                  ? { ...currentInnerAcc, votes: currentInnerAcc.votes + currentCandidate.votes }
                  : currentInnerAcc,
              )
            : [...innerAcc, { ...currentCandidate }]
        }, [] as CandidatesWithVote[]),
      ],
    }),
    {
      year: 0,
      office: null,
      candidatesWithVotes: [],
    } as CongressDataResponse,
  )

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
