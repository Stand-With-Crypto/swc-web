import {
  CandidatesWithVote,
  CongressDataResponse,
  GetAllCongressDataProps,
  GetAllCongressDataResponse,
  RacesVotingDataResponse,
} from '@/data/aggregations/decisionDesk/types'
import { getPoliticianFindMatch, normalizeName } from '@/data/aggregations/decisionDesk/utils'
import { DTSI_AllPeopleQuery } from '@/data/dtsi/generated'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'

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
        const [currentPersonFirstName] = currentPerson.firstName.split(' ')
        const [currentPersonLastName] = currentPerson.lastName.split(' ')

        const normalizedPersonFirstName = normalizeName(currentPersonFirstName)
        const normalizedPersonLastName = normalizeName(currentPersonLastName)
        const normalizedCandidateFirstName = normalizeName(currentCandidate.firstName)
        const normalizedCandidateLastName = normalizeName(currentCandidate.lastName)

        return getPoliticianFindMatch(
          normalizedPersonFirstName,
          normalizedPersonLastName,
          normalizedCandidateFirstName,
          normalizedCandidateLastName,
        )
      }) ?? null

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
