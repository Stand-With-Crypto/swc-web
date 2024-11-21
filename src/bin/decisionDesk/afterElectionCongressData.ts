import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { getCongressVotingData } from '@/utils/server/decisionDesk/getCongressVotingData'

async function generateAfterElectionCongressData() {
  const afterElectionCongressData = await getCongressVotingData()
  const afterElectionCongressDataMap = afterElectionCongressData.map(currentCongressData => {
    return {
      ['DDHQ Winner First Name']: currentCongressData.ddhqWinnerFirstName,
      ['DDHQ Winner Last Name']: currentCongressData.ddhqWinnerLastName,
      ['DTSI Match First Name']: currentCongressData.dtsiMatchFirstName,
      ['DTSI Match Last Name']: currentCongressData.dtsiMatchLastName,
      ['DTSI Match Score']: currentCongressData.dtsiMatchScore,
      ['DTSI Match Letter Grade']: currentCongressData.dtsiMatchLetterGrade,
      ['DTSI Match Role State']: currentCongressData.dtsiMatchRoleState,
      ['DTSI Match Role District']: currentCongressData.dtsiMatchRoleDistrict,
      ['DTSI Match Role Category']: currentCongressData.dtsiMatchRoleCategory,
      ['DTSI Match Role Date Start']: currentCongressData.dtsiMatchRoleDateStart,
      ['DTSI Party Category']: currentCongressData.dtsiPartyCategory,
      ['Total Votes Won']: currentCongressData.totalVotesWon,
      ['Race Total Votes']: currentCongressData.raceTotalVotes,
      ['Last Updated DDHQ']: currentCongressData.lastUpdatedDDHQ,
      ['Race Type']: currentCongressData.raceType,
      ['Race State']: currentCongressData.raceState,
      ['Race District']: currentCongressData.raceDistrict,
    }
  })

  const workbook = xlsx.utils.book_new()
  const worksheet = xlsx.utils.json_to_sheet(afterElectionCongressDataMap)

  xlsx.utils.book_append_sheet(workbook, worksheet, 'After Election Info')

  await xlsx.writeFile(workbook, './src/bin/localCache/afterElectionCongressData.xlsx')
}

void runBin(generateAfterElectionCongressData)
