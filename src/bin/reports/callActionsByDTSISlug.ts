import { UserActionType } from '@prisma/client'
import { subDays } from 'date-fns'
import { groupBy } from 'lodash-es'
import xlsx from 'xlsx'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'

const params = yargs(hideBin(process.argv)).option('daysOfData', {
  type: 'number',
  demandOption: true,
})

async function emailActionsByDTSISlug() {
  const { daysOfData } = await params.argv
  const endDatetime = new Date()
  const startDatetime = subDays(endDatetime, daysOfData)
  const actions = await prismaClient.userAction.findMany({
    where: {
      actionType: UserActionType.CALL,
      datetimeCreated: { gte: startDatetime, lte: endDatetime },
    },
    include: {
      userActionCall: true,
    },
  })
  const recipients = actions.map(action => action.userActionCall)
  const actionsByDTSISlug = groupBy(recipients, x => x?.recipientDtsiSlug)
  const countRows = Object.entries(actionsByDTSISlug).map(([dtsiSlug, rows]) => ({
    dtsiSlug,
    count: rows.length,
  }))
  const workbook = xlsx.utils.book_new()

  const worksheet = xlsx.utils.json_to_sheet(countRows)
  xlsx.utils.book_append_sheet(workbook, worksheet, `Calls By DTSI Slug - ${daysOfData} Days`)
  await xlsx.writeFile(workbook, './src/bin/localCache/callActionsByDTSISlug.xlsx')
}

void runBin(emailActionsByDTSISlug)
