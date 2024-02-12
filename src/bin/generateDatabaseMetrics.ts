import { UserActionType } from '@prisma/client'
import { addWeeks, endOfDay, subDays, subWeeks } from 'date-fns'
import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'
import { camelCaseToWords } from '@/utils/shared/camelCaseToWords'

const WEEKS_IN_REPORT = 12

function getStartingSunday() {
  const currentDate = subWeeks(subDays(new Date(), 1), WEEKS_IN_REPORT)
  const dayOfWeek = currentDate.getDay()
  return subDays(currentDate, dayOfWeek === 0 ? 0 : dayOfWeek)
}
function getEndingDate(startingSunday: Date) {
  return endOfDay(addWeeks(subDays(startingSunday, 1), WEEKS_IN_REPORT))
}
const gteDate = getStartingSunday()
const lteDate = getEndingDate(gteDate)

async function generateDatabaseMetrics() {
  const [
    userCount,
    userCountHasOptedInToMembership,
    userCountHasOptedInToEmails,
    userCountHasOptedInToSms,
    _usersByWeekByAcquisitionSource,
    _userActionsByWeekByActionType,
  ] = await Promise.all([
    prismaClient.user.count(),
    prismaClient.user.count({ where: { hasOptedInToMembership: true } }),
    prismaClient.user.count({ where: { hasOptedInToEmails: true } }),
    prismaClient.user.count({ where: { hasOptedInToSms: true } }),
    prismaClient.$queryRaw`
    SELECT 
        STR_TO_DATE(CONCAT(YEARWEEK(datetime_created), ' Sunday'), '%X%V %W') AS datetimeCreatedWeek,
        acquisition_source as acquisitionSource, 
        COUNT(*) AS totalCount
    FROM user
    WHERE datetime_created >= ${gteDate} AND datetime_created <= ${lteDate}
    GROUP BY  
        datetimeCreatedWeek,
        acquisitionSource
    ORDER BY
        datetimeCreatedWeek,
        acquisitionSource
    `,
    prismaClient.$queryRaw`
    SELECT 
        STR_TO_DATE(CONCAT(YEARWEEK(datetime_created), ' Sunday'), '%X%V %W') AS datetimeCreatedWeek,
        action_type as actionType, 
        COUNT(*) AS totalCount
    FROM user_action
    WHERE datetime_created >= ${gteDate} AND datetime_created <= ${lteDate}
    GROUP BY  
        datetimeCreatedWeek,
        actionType
    ORDER BY
        datetimeCreatedWeek,
        actionType
    `,
  ])
  const workbook = xlsx.utils.book_new()

  let worksheet = xlsx.utils.json_to_sheet(
    Object.entries({
      userCount,
      userCountHasOptedInToMembership,
      userCountHasOptedInToEmails,
      userCountHasOptedInToSms,
    }).map(([metric, value]) => ({ Metric: camelCaseToWords(metric), Value: value })),
  )
  xlsx.utils.book_append_sheet(workbook, worksheet, 'RAW - Top Level Metrics')

  worksheet = xlsx.utils.json_to_sheet(
    (
      _usersByWeekByAcquisitionSource as Array<{
        datetimeCreatedWeek: string
        acquisitionSource: string
        totalCount: bigint
      }>
    ).map(data => ({
      'Datetime Created Week': data.datetimeCreatedWeek,
      'Acquisition Source': data.acquisitionSource || 'Unknown',
      Count: parseInt(data.totalCount.toString(), 10),
    })),
  )
  xlsx.utils.book_append_sheet(workbook, worksheet, 'RAW - Users By Week And Source')

  worksheet = xlsx.utils.json_to_sheet(
    (
      _userActionsByWeekByActionType as Array<{
        datetimeCreatedWeek: string
        actionType: UserActionType
        totalCount: bigint
      }>
    ).map(data => ({
      'Datetime Created Week': data.datetimeCreatedWeek,
      'Action Type': data.actionType,
      Count: parseInt(data.totalCount.toString(), 10),
    })),
  )
  xlsx.utils.book_append_sheet(workbook, worksheet, 'RAW - Actions By Week And Type')

  await xlsx.writeFile(workbook, './src/bin/localCache/userActionsByWeekByActionType.xlsx')
}

runBin(generateDatabaseMetrics)
