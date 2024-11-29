import { UserActionType } from '@prisma/client'
import { uniqBy } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

const CLEANUP_DATADOG_SYNTHETIC_TESTS_FUNCTION_ID = 'script.cleanup-datadog-synthetic-tests'

const DATADOG_SYNTHETIC_TESTS_EMAIL_DOMAIN = '@synthetics.dtdg.co'

export const cleanupDatadogSyntheticTestsWithInngest = inngest.createFunction(
  {
    id: CLEANUP_DATADOG_SYNTHETIC_TESTS_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { cron: 'TZ=America/New_York 0 3 * * *' }, // Every day - 3AM EST
  async ({ step }) => {
    const users = await step.run('script.getSyntheticTestUsers', () =>
      prismaClient.user.findMany({
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
      }),
    )

    const filteredUsers = uniqBy(users, user => user.id)

    const userActionRemovalPromises = filteredUsers.map(user => {
      const filteredUserActions = user.userActions.filter(
        userAction => userAction.actionType !== UserActionType.OPT_IN,
      )

      const userActionIds = filteredUserActions.map(userAction => userAction.id)

      return prismaClient.userAction.deleteMany({
        where: {
          id: {
            in: userActionIds,
          },
        },
      })
    })

    await step.run('script.removeUserActions', () => Promise.all(userActionRemovalPromises))

    const userEmailRemovalPromises = filteredUsers.map(user => {
      const userEmailIds = user.userEmailAddresses.map(userEmail => userEmail.id)

      return prismaClient.userEmailAddress.deleteMany({
        where: {
          id: {
            in: userEmailIds,
          },
        },
      })
    })

    await step.run('script.removeUserEmails', () => Promise.all(userEmailRemovalPromises))

    const usersToUpdatePromises = filteredUsers.map(user => {
      return prismaClient.user.update({
        where: {
          id: user.id,
        },
        data: {
          primaryUserEmailAddressId: null,
        },
      })
    })

    await step.run('script.updateUsers', () => Promise.all(usersToUpdatePromises))

    return {
      usersFound: filteredUsers.length,
      usersIds: filteredUsers.map(user => user.id).join(', '),
    }
  },
)
