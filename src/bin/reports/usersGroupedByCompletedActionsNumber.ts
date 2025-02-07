import xlsx from 'xlsx'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'

async function usersGroupedByCompletedActionsNumber() {
  const result: { actions_completed: number; users: number }[] = await prismaClient.$queryRaw`
    SELECT
    CAST(action_count AS SIGNED) as actions_completed, CAST(COUNT(user_id) AS SIGNED) as users
    FROM (
      SELECT user_id, COUNT(action_type) AS action_count
        FROM user_action
        WHERE action_type != 'OPT_IN'
        GROUP BY user_id
    )
    AS user_actions
    GROUP BY action_count
    ORDER BY action_count asc;
    `

  const formattedResult = result.map((row: any) => ({
    actions_completed: Number(row.actions_completed),
    users: Number(row.users),
  }))

  const rows = formattedResult.map(row => ({
    numberOfActions: row.actions_completed,
    numberOfUsers: row.users,
  }))

  const workbook = xlsx.utils.book_new()
  const worksheet = xlsx.utils.json_to_sheet(rows)
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Users By Action (No Opt-Ins)')

  await xlsx.writeFile(workbook, './src/bin/reports/usersGroupedByCompletedActions.xlsx')

  console.table(rows)
}

void runBin(usersGroupedByCompletedActionsNumber)
