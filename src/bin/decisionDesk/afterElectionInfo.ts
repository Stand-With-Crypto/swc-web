import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { getElectedInfo } from '@/utils/server/decisionDesk/getElectedInfo'

async function generateAfterElectionInfo() {
  const afterElectionInfoData = await getElectedInfo()
  const afterElectionInfoDataMap = [
    {
      ['Total Elected Incumbents A/B']: afterElectionInfoData.totalElectedABIncumbents,
      ['Percent Elected Incumbents A/B']: afterElectionInfoData.percentElectedABIncumbents,
      ['Total Not Elected Candidates D/F']: afterElectionInfoData.totalNotElectedDFCandidates,
      ['Percent Not Elected Candidates D/F']: afterElectionInfoData.percentNotElectedDFCandidates,
      ['Total Votes Cast A/B Candidates']: afterElectionInfoData.totalVotesCastABCandidates,
    },
  ]

  const workbook = xlsx.utils.book_new()
  const worksheet = xlsx.utils.json_to_sheet(afterElectionInfoDataMap)

  xlsx.utils.book_append_sheet(workbook, worksheet, 'After Election Info')

  await xlsx.writeFile(workbook, './src/bin/localCache/afterElectionInfo.xlsx')
}

void runBin(generateAfterElectionInfo)
