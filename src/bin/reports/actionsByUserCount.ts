import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'

async function actionsByUserCount() {
  let hasActionsLeft = true
  let skip = 0
  const limit = 100000

  const userActionsMap = new Map<string, number>()

  while (hasActionsLeft) {
    const usersBatch = (await prismaClient.$queryRaw`
        SELECT u.id AS userId, COUNT(DISTINCT ua.action_type) AS actions
        FROM user u
        LEFT JOIN user_action ua ON u.id = ua.user_id
        WHERE ua.action_type != 'OPT_IN' OR ua.action_type IS NULL
        GROUP BY u.id
        LIMIT ${limit} OFFSET ${skip};
      `) as { userId: string; actions: string }[]

    console.log(`Processing ${usersBatch.length} users`)

    for (const { userId, actions } of usersBatch) {
      const actionCount = parseInt(actions, 10)
      userActionsMap.set(userId, actionCount)
    }

    if (usersBatch.length === 0) {
      hasActionsLeft = false
    }

    skip += limit
  }

  // Aggregate results by action counts
  const actionCounts = Array.from(userActionsMap.values()).reduce(
    (acc, actions) => {
      acc[actions] = (acc[actions] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Format the result
  const result = Object.entries(actionCounts)
    .map(([actions, users]) => ({
      actions: Number(actions),
      users,
    }))
    .sort((a, b) => a.actions - b.actions)

  const workbook = xlsx.utils.book_new()

  const reportFile = './src/bin/localCache/actionsByUserCount.xlsx'
  const worksheet = xlsx.utils.json_to_sheet(result)
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Actions By User Count')
  await xlsx.writeFile(workbook, reportFile)

  console.log(`Report saved to ${reportFile}`)
}

void runBin(actionsByUserCount)
