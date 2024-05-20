import { Address, User } from '@prisma/client'
import { groupBy } from 'lodash-es'
import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'

async function usersByState() {
  let users: Array<User & { address: Address | null }> = []
  let hasAllResults = false
  while (!hasAllResults) {
    const res = await prismaClient.user.findMany({
      include: {
        address: true,
      },
      where: { address: { countryCode: 'US' } },
      take: 100_000,
      skip: users.length,
    })
    console.log(`res length ${res.length}, next skip ${users.length}`)
    if (res.length < 100_000) {
      hasAllResults = true
    }
    users = users.concat(res)
  }
  const addresses = users.flatMap(user => user.address)
  const actionsByState = groupBy(addresses, x =>
    !x
      ? 'no address'
      : x.countryCode !== 'US'
        ? 'not US address'
        : x.administrativeAreaLevel1 || 'no state',
  )
  const countRows = Object.entries(actionsByState).map(([state, rows]) => ({
    state,
    count: rows.length,
  }))
  const workbook = xlsx.utils.book_new()

  const worksheet = xlsx.utils.json_to_sheet(countRows)
  xlsx.utils.book_append_sheet(workbook, worksheet, `User By State`)
  await xlsx.writeFile(workbook, './src/bin/localCache/usersByState.xlsx')
}

void runBin(usersByState)
