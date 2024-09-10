import { UserActionType } from '@prisma/client'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

interface ClearUpActionsPayload {
  data: {
    userId: string
    actions?: UserActionType[]
    persist?: boolean
  }
}

const CLEAR_UP_USER_ACTIONS_INNGEST_EVENT_NAME = 'script/clear-up-user-actions'
const CLEAR_UP_USER_ACTIONS_INNGEST_FUNCTION_ID = 'script.clear-up-user-actions'

export type ClearUpActionsInngestSchema = {
  [CLEAR_UP_USER_ACTIONS_INNGEST_EVENT_NAME]: ClearUpActionsPayload
}

export const clearUpUserActions = inngest.createFunction(
  {
    id: CLEAR_UP_USER_ACTIONS_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: CLEAR_UP_USER_ACTIONS_INNGEST_EVENT_NAME },
  async ({ event, step, logger }) => {
    const { userId, actions, persist } = event.data

    const userWithActions = await step.run('get-user-actions', async () => {
      return await prismaClient.user.findFirst({
        where: {
          id: userId,
        },
        include: {
          userActions: true,
        },
      })
    })

    if (!userWithActions) {
      logger.error(`User not found with id ${userId}`)

      return { message: `User not found with id ${userId}` }
    }

    const userActions = userWithActions.userActions

    if (!userActions || userActions.length === 0) {
      logger.info(`No user actions found for user with id ${userId}`)

      return { message: 'No user actions found', userId }
    }

    const actionsToBeDeleted = actions
      ? userActions.filter(userAction => actions.includes(userAction.actionType))
      : userActions

    if (!persist) {
      logger.info(`Dry run for user with id ${userId}`, actionsToBeDeleted)

      return { message: 'Dry run', userId, count: actionsToBeDeleted.length, actionsToBeDeleted }
    }

    const deletedActions = await step.run('delete-user-actions', async () => {
      return await prismaClient.userAction.deleteMany({
        where: {
          id: {
            in: actionsToBeDeleted.map(action => action.id),
          },
          user: {
            id: userId,
          },
        },
      })
    })

    logger.info(`Actions deleted successfully for user with id ${userId}`, deletedActions)

    return {
      message: 'Actions deleted successfully',
      userId,
      count: deletedActions.count,
      actionsToBeDeleted,
    }
  },
)
