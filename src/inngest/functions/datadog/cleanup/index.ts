import { User, UserAction, UserActionType, UserEmailAddress } from '@prisma/client'
import { uniqBy } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

type UserWithRelations = User & {
  userActions: UserAction[]
  userEmailAddresses: UserEmailAddress[]
}

const CLEANUP_DATADOG_SYNTHETIC_TESTS_FUNCTION_ID = 'script.cleanup-datadog-synthetic-tests'

const DATADOG_SYNTHETIC_TESTS_EMAIL_DOMAIN = '@synthetics.dtdg.co'

export const cleanupDatadogSyntheticTestsWithInngest = inngest.createFunction(
  {
    id: CLEANUP_DATADOG_SYNTHETIC_TESTS_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { cron: 'TZ=America/New_York 0 * * * *' }, // Every hour
  async ({ step }) => {
    try {
      const users = await prismaClient.user.findMany({
        where: {
          userEmailAddresses: {
            some: {
              emailAddress: {
                contains: DATADOG_SYNTHETIC_TESTS_EMAIL_DOMAIN,
              },
            },
          },
        },
        include: {
          userEmailAddresses: true,
          userActions: true,
        },
      })

      const filteredUsers = uniqBy(users, user => user.id)

      if (filteredUsers.length === 0) {
        return { usersFound: 0 }
      }

      await step.run('script.updateUsers', () => Promise.all(filteredUsers.map(updateUser)))

      await step.run('script.removeUserActions', () =>
        Promise.all(filteredUsers.map(removeUserActions)),
      )

      await step.run('script.removeUserEmails', () =>
        Promise.all(filteredUsers.map(removeUserEmails)),
      )

      return {
        usersFound: filteredUsers.length,
        usersIds: filteredUsers.map(user => user.id).join(', '),
      }
    } catch (error) {
      console.error('Error processing users:', error)
      throw error
    }
  },
)

async function updateUser(user: User) {
  return prismaClient.user.update({
    where: { id: user.id },
    data: {
      primaryUserEmailAddressId: undefined,
      primaryUserEmailAddress: undefined,
    },
  })
}

async function removeUserActions(user: UserWithRelations) {
  const filteredUserActions = user.userActions.filter(
    userAction => userAction.actionType !== UserActionType.OPT_IN,
  )
  const userActionIds = filteredUserActions.map(userAction => userAction.id)

  return prismaClient.userAction.deleteMany({
    where: { id: { in: userActionIds } },
  })
}

async function removeUserEmails(user: UserWithRelations) {
  const userEmailIds = user.userEmailAddresses.map(userEmail => userEmail.id)

  return prismaClient.userEmailAddress.deleteMany({
    where: {
      id: { in: userEmailIds },
      datetimeCreated: {
        // We only want to delete emails that were created more than 30 minutes ago
        // This approach prevents any potential bugs from deleting emails while the synthetic tests are running.
        gte: new Date(new Date().getTime() - 30 * 60 * 1000), // 30 minutes
      },
    },
  })
}
