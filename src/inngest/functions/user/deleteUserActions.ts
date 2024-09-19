import { UserActionType } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

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
    const { userId, customActions, persist } = event.data

    if (
      customActions &&
      customActions.length > 0 &&
      customActions.includes(UserActionType.OPT_IN)
    ) {
      logger.error('Cannot delete OPT_IN action type for user with id')

      throw new NonRetriableError('Cannot delete OPT_IN action type')
    }

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

      throw new NonRetriableError(`User not found with id ${userId}`)
    }

    const currentUserActions = userWithActions.userActions

    if (!currentUserActions || currentUserActions.length === 0) {
      logger.error(`No user actions found for user with id ${userId}`)

      throw new NonRetriableError(`No user actions found for user with id ${userId}`)
    }

    const userActionsToBeDeleted = customActions
      ? currentUserActions.filter(userAction => customActions.includes(userAction.actionType))
      : currentUserActions.filter(userAction => userAction.actionType !== UserActionType.OPT_IN)

    if (userActionsToBeDeleted.length === currentUserActions.length) {
      logger.error(`Cannot delete all user actions for user with id ${userId}`)

      throw new NonRetriableError(`Cannot delete all user actions for user with id ${userId}`)
    }

    if (!persist) {
      logger.info(`Dry run for user with id ${userId}`, userActionsToBeDeleted)

      return {
        message: 'Dry run',
        count: userActionsToBeDeleted.length,
        userId,
        userActionsToBeDeleted,
      }
    }

    const deletedActions = await step.run('delete-user-actions', async () => {
      return await prismaClient.userAction.deleteMany({
        where: {
          id: {
            in: userActionsToBeDeleted.map(action => action.id),
          },
          user: {
            id: userId,
          },
        },
      })
    })

    logger.info(`Actions deleted successfully for user with id ${userId}`, userActionsToBeDeleted)

    return {
      message: 'Actions deleted successfully',
      count: deletedActions.count,
      userId,
      deletedActions: userActionsToBeDeleted,
    }
  },
)
