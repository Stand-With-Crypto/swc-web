import { UserActionType } from '@prisma/client'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

interface DeleteUserActionsPayload {
  userId: string
  customActions?: UserActionType[]
  persist?: boolean
}

const DELETE_USER_ACTIONS_INNGEST_EVENT_NAME = 'script/delete-user-actions'
const DELETE_USER_ACTIONS_INNGEST_FUNCTION_ID = 'script.delete-user-actions'

export const deleteUserActions = inngest.createFunction(
  {
    id: DELETE_USER_ACTIONS_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: DELETE_USER_ACTIONS_INNGEST_EVENT_NAME },
  async ({ event, step, logger }) => {
    const { userId, customActions, persist } = event.data as DeleteUserActionsPayload

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

    const actionsToBeDeleted = customActions
      ? userActions.filter(userAction => customActions.includes(userAction.actionType))
      : userActions

    if (!persist) {
      logger.info(`Dry run for user with id ${userId}`, actionsToBeDeleted)

      return { message: 'Dry run', count: actionsToBeDeleted.length, userId, actionsToBeDeleted }
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

    logger.info(`Actions deleted successfully for user with id ${userId}`, actionsToBeDeleted)

    return {
      message: 'Actions deleted successfully',
      count: deletedActions.count,
      userId,
      deletedActions: actionsToBeDeleted,
    }
  },
)
