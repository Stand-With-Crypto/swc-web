import { format } from 'date-fns'

import { getAllRacesData } from '@/data/aggregations/decisionDesk/getAllRacesData'
import { getDtsiMatchFromDdhq } from '@/data/aggregations/decisionDesk/utils'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { convertDTSIPersonStanceScoreToLetterGrade } from '@/utils/dtsi/dtsiStanceScoreUtils'

interface CongressDataElectionData {
  ddhqWinnerFirstName: string
  ddhqWinnerLastName: string
  dtsiMatchFirstName: string
  dtsiMatchLastName: string
  dtsiMatchScore: number
  dtsiMatchLetterGrade: string
  dtsiMatchRoleState: string
  dtsiMatchRoleDistrict: string
  dtsiMatchRoleCategory: string
  dtsiMatchRoleDateStart: string
  dtsiPartyCategory: string
  totalVotesWon: number
  raceTotalVotes: number
  lastUpdatedDDHQ: string
  raceType: string // (congress/senate)
  ddhqState: string
  dtsiMatchState: string
  ddhqDistrict: string
  dtsiMatchDistrict: string
}

const params = {
  race_date: '2024-11-05',
  limit: '250',
  year: '2024',
}

export async function getCongressVotingData(): Promise<CongressDataElectionData[]> {
  const [senateData, houseData, laSenateData, laHouseData, dtsiAllPeopleData] = await Promise.all([
    getAllRacesData({
      ...params,
      name: 'General Election',
      office: 'US Senate',
    }),
    getAllRacesData({
      ...params,
      name: 'General Election',
      office: 'US House',
    }),
    getAllRacesData({
      ...params,
      office: 'US Senate',
      state: 'LA',
      election_type: '1',
    }),
    getAllRacesData({
      ...params,
      office: 'US House',
      state: 'LA',
      election_type: '1',
    }),
    queryDTSIAllPeople(),
  ])

  console.log('Ended promise all')

  const senateDataWithoutLA = senateData.filter(
    currentSenateData => currentSenateData.state !== 'LA',
  )
  const houseDataWithoutLA = houseData.filter(currentHouseData => currentHouseData.state !== 'LA')

  const allSenateData = senateDataWithoutLA.concat(laSenateData)
  const allHouseData = houseDataWithoutLA.concat(laHouseData)

  const allCongressData = allSenateData.concat(allHouseData)
  const allElectedCongressPeople = allCongressData.flatMap(currentRaceData => {
    const candidatesWithVotes = currentRaceData.candidatesWithVotes.filter(
      currentCandidate => currentCandidate.elected,
    )

    return {
      ...currentRaceData,
      candidatesWithVotes,
    }
  })

  console.log('Ended allElectedCongressPeople mapping')

  const allCandidates = allElectedCongressPeople.flatMap(currentRaceData => {
    return currentRaceData.candidatesWithVotes.map(currentDDHQCandidate => {
      const dtsiMatch = getDtsiMatchFromDdhq(currentDDHQCandidate, dtsiAllPeopleData.people)

      const dtsiMatchLetterGrade = dtsiMatch
        ? convertDTSIPersonStanceScoreToLetterGrade(dtsiMatch)
        : null

      return {
        ddhqWinnerFirstName: currentDDHQCandidate.firstName ?? 'N/A',
        ddhqWinnerLastName: currentDDHQCandidate.lastName ?? 'N/A',
        dtsiMatchFirstName: dtsiMatch?.firstName ?? 'N/A',
        dtsiMatchLastName: dtsiMatch?.lastName ?? 'N/A',
        dtsiMatchRoleState: dtsiMatch?.primaryRole?.primaryState ?? 'N/A',
        dtsiMatchRoleDistrict: dtsiMatch?.primaryRole?.primaryDistrict ?? 'N/A',
        dtsiMatchRoleCategory: dtsiMatch?.primaryRole?.roleCategory ?? 'N/A',
        dtsiMatchRoleDateStart: dtsiMatch?.primaryRole?.dateStart
          ? format(new Date(dtsiMatch.primaryRole.dateStart), 'yyyy-MM-dd')
          : 'N/A',
        dtsiMatchScore:
          dtsiMatch?.manuallyOverriddenStanceScore ?? dtsiMatch?.computedStanceScore ?? 0,
        dtsiMatchLetterGrade: dtsiMatchLetterGrade ?? 'N/A',
        dtsiPartyCategory: dtsiMatch?.politicalAffiliationCategory ?? 'N/A',
        totalVotesWon: currentDDHQCandidate.votes ?? 0,
        raceTotalVotes: currentRaceData.totalVotes,
        lastUpdatedDDHQ: currentRaceData.lastUpdated
          ? format(new Date(currentRaceData.lastUpdated), 'yyyy-MM-dd HH:mm:ss')
          : 'N/A',
        raceType: currentRaceData.office?.officeName ?? 'N/A',
        ddhqState: currentRaceData.state,
        dtsiMatchState: dtsiMatch?.primaryRole?.primaryState ?? 'N/A',
        ddhqDistrict: currentRaceData.district,
        dtsiMatchDistrict: dtsiMatch?.primaryRole?.primaryDistrict ?? 'N/A',
      }
    })
  })

  return allCandidates
}
