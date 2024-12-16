import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'

async function actionsByUserCount() {
  let hasActionsLeft = true
  let skip = 0
  const limit = 100000

  const userActionsMap = new Map<string, number>()

  console.log('Fetching user actions...')

  while (hasActionsLeft) {
    const usersBatch = await prismaClient.$queryRaw<Array<{ userId: string; actions: string }>>`
        SELECT u.id AS userId, COUNT(DISTINCT ua.action_type) AS actions
        FROM user u
        LEFT JOIN user_action ua ON u.id = ua.user_id
        WHERE ua.action_type != 'OPT_IN' OR ua.action_type IS NULL
        GROUP BY u.id
        LIMIT ${limit} OFFSET ${skip};
      `

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

  console.log('Fetching OPT_IN actions')

  let hasOptInActionsLeft = true
  skip = 0

  let usersThatOnlyOptedIn = 0

  while (hasOptInActionsLeft) {
    const optInActionsCount = await prismaClient.$queryRaw<Array<{ id: string }>>`
        SELECT u.id
        FROM user u
        LEFT JOIN user_action ua ON u.id = ua.user_id
        GROUP BY u.id
        HAVING COUNT(DISTINCT ua.action_type) = 1 AND MAX(ua.action_type) = 'OPT_IN'
        LIMIT ${limit} OFFSET ${skip};
    `

    console.log(`Processing ${optInActionsCount.length} users`)

    if (optInActionsCount.length === 0) {
      hasOptInActionsLeft = false
    }

    usersThatOnlyOptedIn += optInActionsCount.length
    skip += limit
  }

  console.log('Aggregating results...')

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
    .map(([actions, users], index) => ({
      actions: Number(actions),
      users: index === 0 ? users + usersThatOnlyOptedIn : users,
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
