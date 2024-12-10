import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { getCongressVotingData2025 } from '@/utils/server/decisionDesk/getCongressVotingData2025'

async function generateAfterElectionCongressData() {
  const afterElectionCongressData = await getCongressVotingData2025()
  const afterElectionCongressDataMap = afterElectionCongressData.map(currentCongressData => {
    return {
      ['First Name']: currentCongressData.firstName,
      ['Last Name']: currentCongressData.lastName,
      ['Congress Type']: currentCongressData.congressType,
      ['DTSI Match First Name']: currentCongressData.dtsiMatchFirstName,
      ['DTSI Match Last Name']: currentCongressData.dtsiMatchLastName,
      ['DTSI Match Slug']: currentCongressData.dtsiMatchSlug,
      ['DTSI Match Role Date Start']: currentCongressData.dtsiMatchRoleDateStart,
      ['DTSI Match Role Date End']: currentCongressData.dtsiMatchRoleDateEnd,
      ['DTSI Match Score']: currentCongressData.dtsiMatchScore,
      ['DTSI Match Letter Grade']: currentCongressData.dtsiMatchLetterGrade,
      ['DTSI Match Role State']: currentCongressData.dtsiMatchRoleState,
      ['DTSI Match Role District']: currentCongressData.dtsiMatchRoleDistrict,
      ['DTSI Match Role Category']: currentCongressData.dtsiMatchRoleCategory,
      ['DTSI Match Role Status']: currentCongressData.dtsiMatchRoleStatus,
      ['DTSI Match Party Category']: currentCongressData.dtsiMatchPartyCategory,
      ['DTSI Match State']: currentCongressData.dtsiMatchState,
      ['DTSI Match District']: currentCongressData.dtsiMatchDistrict,
    }
  })

  const workbook = xlsx.utils.book_new()
  const worksheet = xlsx.utils.json_to_sheet(afterElectionCongressDataMap)

  xlsx.utils.book_append_sheet(workbook, worksheet, 'After Election Info 2025')

  await xlsx.writeFile(workbook, './src/bin/localCache/afterElectionCongressData2025.xlsx')
}

void runBin(generateAfterElectionCongressData)
