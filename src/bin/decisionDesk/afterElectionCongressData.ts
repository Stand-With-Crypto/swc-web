import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { getCongressVotingData } from '@/utils/server/decisionDesk/getCongressVotingData'

async function generateAfterElectionCongressData() {
  const afterElectionCongressData = await getCongressVotingData()
  const afterElectionCongressDataMap = afterElectionCongressData.map(currentCongressData => {
    const hasDifferentFirstName =
      currentCongressData.ddhqWinnerFirstName !== currentCongressData.dtsiMatchFirstName
    const hasDifferentLastName =
      currentCongressData.ddhqWinnerLastName !== currentCongressData.dtsiMatchLastName

    return {
      ['DDHQ Winner First Name']: currentCongressData.ddhqWinnerFirstName,
      ['DDHQ Winner Last Name']: currentCongressData.ddhqWinnerLastName,
      ['DTSI Match First Name']: currentCongressData.dtsiMatchFirstName,
      ['DTSI Match Last Name']: currentCongressData.dtsiMatchLastName,
      ['DTSI Match Slug']: currentCongressData.dtsiMatchSlug,
      ['DTSI Match Score']: currentCongressData.dtsiMatchScore,
      ['DTSI Match Letter Grade']: currentCongressData.dtsiMatchLetterGrade,
      ['DTSI Match Role State']: currentCongressData.dtsiMatchRoleState,
      ['DTSI Match Role District']: currentCongressData.dtsiMatchRoleDistrict,
      ['DTSI Match Role Category']: currentCongressData.dtsiMatchRoleCategory,
      ['DTSI Match Role Date Start']: currentCongressData.dtsiMatchRoleDateStart,
      ['DTSI Match Role Date End']: currentCongressData.dtsiMatchRoleDateEnd,
      ['DTSI Match Role Status']: currentCongressData.dtsiMatchRoleStatus,
      ['DTSI Match Party Category']: currentCongressData.dtsiMatchPartyCategory,
      ['DDHQ Incumbent']: currentCongressData.incumbent,
      ['DDHQ Elected']: currentCongressData.elected,
      ['Total Votes Won']: currentCongressData.totalVotesWon,
      ['Race Total Votes']: currentCongressData.raceTotalVotes,
      ['Last Updated DDHQ']: currentCongressData.lastUpdatedDDHQ,
      ['DDHQ Race Type']: currentCongressData.raceType,
      ['DDHQ State']: currentCongressData.ddhqState,
      ['DTSI Match State']: currentCongressData.dtsiMatchState,
      ['DDHQ District']: currentCongressData.ddhqDistrict,
      ['DTSI Match District']: currentCongressData.dtsiMatchDistrict,
      ['Has Different First Name']: hasDifferentFirstName,
      ['Has Different Last Name']: hasDifferentLastName,
    }
  })

  const workbook = xlsx.utils.book_new()
  const worksheet = xlsx.utils.json_to_sheet(afterElectionCongressDataMap)

  xlsx.utils.book_append_sheet(workbook, worksheet, 'After Election Info')

  await xlsx.writeFile(workbook, './src/bin/localCache/afterElectionCongressData.xlsx')
}

void runBin(generateAfterElectionCongressData)
