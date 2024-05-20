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
      actionType: UserActionType.EMAIL,
      datetimeCreated: { gte: startDatetime, lte: endDatetime },
    },
    include: {
      user: {
        include: {
          address: true,
        },
      },
    },
  })
  const addresses = actions.flatMap(action => action.user.address)
  const actionsByState = groupBy(addresses, x => x?.administrativeAreaLevel1 || 'unknown')
  const countRows = Object.entries(actionsByState).map(([state, rows]) => ({
    state,
    count: rows.length,
  }))
  const workbook = xlsx.utils.book_new()

  const worksheet = xlsx.utils.json_to_sheet(countRows)
  xlsx.utils.book_append_sheet(workbook, worksheet, `Emails By User State - ${daysOfData} Days`)
  await xlsx.writeFile(workbook, './src/bin/localCache/emailActionsByUserState.xlsx')
}

void runBin(emailActionsByDTSISlug)
