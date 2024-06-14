import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'

async function usersByDatetimeCreated() {
  const results: Array<{ year: string; month: string; day: string; userCount: bigint }> =
    await prismaClient.$queryRaw`
    SELECT YEAR(datetime_created) AS year, MONTH(datetime_created) AS month, DAY(datetime_created) AS day, COUNT(*) AS userCount
    FROM user
    GROUP BY year, month, day
    ORDER BY year ASC, month ASC, day ASC;
`
  const formattedResults = results.map(res => ({
    year: parseInt(res.year, 10),
    month: parseInt(res.month, 10),
    day: parseInt(res.day, 10),
    userCount: parseInt(res.userCount.toString(), 10),
    date: `${res.year}-${res.month}-${res.day}`,
  }))
  const workbook = xlsx.utils.book_new()

  const worksheet = xlsx.utils.json_to_sheet(formattedResults)
  xlsx.utils.book_append_sheet(workbook, worksheet, `User By Datetime Created`)
  await xlsx.writeFile(workbook, './src/bin/localCache/usersByDatetimeCreated.xlsx')
}

void runBin(usersByDatetimeCreated)
