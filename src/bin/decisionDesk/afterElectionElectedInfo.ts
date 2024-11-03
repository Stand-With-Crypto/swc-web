import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { getElectedCandidates } from '@/utils/server/decisionDesk/getElectedCandidates'

async function generateAfterElectionElectedInfo() {
  const afterElectionElectedInfoData = await getElectedCandidates()
  const afterElectionElectedInfoDataMap = afterElectionElectedInfoData.map(currentElected => {
    return {
      ['First Name']: currentElected.firstName,
      ['Last Name']: currentElected.lastName,
      ['Party']: currentElected.partyName,
      ['Slug']: currentElected.slug,
      ['Office']: currentElected.office,
      ['State']: currentElected.state,
      ['District']: currentElected.district,
      ['Elected']: currentElected.elected,
    }
  })

  const workbook = xlsx.utils.book_new()
  const worksheet = xlsx.utils.json_to_sheet(afterElectionElectedInfoDataMap)

  xlsx.utils.book_append_sheet(workbook, worksheet, 'After Election Elected Info')

  await xlsx.writeFile(workbook, './src/bin/localCache/afterElectionElectedInfo.xlsx')
}

void runBin(generateAfterElectionElectedInfo)
