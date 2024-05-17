import { UserActionType } from '@prisma/client'
import { subDays } from 'date-fns'
import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'
import { groupBy } from 'lodash-es'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

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
      actionType: UserActionType.EMAIL,
      datetimeCreated: { gte: startDatetime, lte: endDatetime },
    },
    include: {
      userActionEmail: {
        include: { userActionEmailRecipients: true },
      },
    },
  })
  const recipients = actions.flatMap(
    action => action.userActionEmail?.userActionEmailRecipients || [],
  )
  const actionsByDTSISlug = groupBy(recipients, x => x.dtsiSlug)
  const countRows = Object.entries(actionsByDTSISlug).map(([dtsiSlug, recipients]) => ({
    dtsiSlug,
    count: recipients.length,
  }))
  const workbook = xlsx.utils.book_new()

  let worksheet = xlsx.utils.json_to_sheet(countRows)
  xlsx.utils.book_append_sheet(workbook, worksheet, `Emails By DTSI Slug - ${daysOfData} Days`)
  await xlsx.writeFile(workbook, './src/bin/localCache/emailActionsByDTSISlug.xlsx')
}

void runBin(emailActionsByDTSISlug)
