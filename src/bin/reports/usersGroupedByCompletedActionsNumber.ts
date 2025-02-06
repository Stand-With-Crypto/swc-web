import { User, UserActionType } from '@prisma/client'
import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'

const BATCH_SIZE = 50000

async function usersGroupedByCompletedActionsNumber() {
  const usersPerActionCount: { [key: number]: number } = {}
  let cursor: string | undefined = undefined

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const usersBatch: any = await prismaClient.user.findMany({
      take: BATCH_SIZE,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        _count: {
          select: {
            userActions: {
              where: {
                actionType: {
                  not: UserActionType.OPT_IN, // Ignore OPT_IN actions
                },
              },
            },
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    })

    if (usersBatch.length === 0) break

    cursor = usersBatch[usersBatch.length - 1].id

    usersBatch.forEach((user: User & { _count: { userActions: number } }) => {
      const actionCount = user._count.userActions
      usersPerActionCount[actionCount] = (usersPerActionCount[actionCount] || 0) + 1
    })

    console.log(`Processed batch of ${usersBatch.length} users`)
  }

  const rows = Object.entries(usersPerActionCount).map(([actions, userCount]) => ({
    numberOfActions: parseInt(actions),
    numberOfUsers: userCount,
  }))

  rows.sort((a, b) => a.numberOfActions - b.numberOfActions)

  const workbook = xlsx.utils.book_new()
  const worksheet = xlsx.utils.json_to_sheet(rows)
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Users By Action Count')

  await xlsx.writeFile(workbook, './src/bin/reports/usersGroupedByCompletedActions.xlsx')

  console.table(rows)
}

void runBin(usersGroupedByCompletedActionsNumber)
