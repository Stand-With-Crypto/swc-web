import { User, UserAction, UserActionType, UserEmailAddress } from '@prisma/client'
import { difference, flatten, uniqBy } from 'lodash-es'

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
      const ThirtyMinutesAgo = new Date().getTime() - 30 * 60 * 1000

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

      const emailAddressesCreatedInLast30MinutesIds = flatten(
        filteredUsers.map(user => {
          return user.userEmailAddresses
            .filter(
              userEmail =>
                userEmail.emailAddress.includes(DATADOG_SYNTHETIC_TESTS_EMAIL_DOMAIN) &&
                userEmail.datetimeCreated.getTime() > ThirtyMinutesAgo,
            )
            .map(userEmail => userEmail.id)
        }),
      )

      await step.run('script.updateUsers', () =>
        Promise.all(
          filteredUsers.map(user => updateUser(user, emailAddressesCreatedInLast30MinutesIds)),
        ),
      )

      await step.run('script.removeUserActions', () =>
        Promise.all(filteredUsers.map(removeUserActions)),
      )

      await step.run('script.removeUserEmails', () =>
        Promise.all(
          filteredUsers.map(user =>
            removeUserEmails(user, emailAddressesCreatedInLast30MinutesIds),
          ),
        ),
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

async function updateUser(user: User, emailAddressesCreatedInLast30MinutesIds: string[]) {
  const primaryUserEmailAddressId = user.primaryUserEmailAddressId

  if (!primaryUserEmailAddressId) return

  const isPrimaryEmailCreatedInLast30Minutes =
    emailAddressesCreatedInLast30MinutesIds.includes(primaryUserEmailAddressId)

  if (isPrimaryEmailCreatedInLast30Minutes) return

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

async function removeUserEmails(
  user: UserWithRelations,
  emailAddressesCreatedInLast30MinutesIds: string[],
) {
  const userEmailIds = user.userEmailAddresses.map(userEmail => userEmail.id)

  const emailIdsToRemove = difference(userEmailIds, emailAddressesCreatedInLast30MinutesIds)

  const ThirtyMinutesAgo = new Date(new Date().getTime() - 30 * 60 * 1000)

  return prismaClient.userEmailAddress.deleteMany({
    where: {
      id: { in: emailIdsToRemove },
      datetimeCreated: {
        // We only want to delete emails that were created more than 30 minutes ago
        // This approach prevents any potential bugs from deleting emails while the synthetic tests are running.
        gte: ThirtyMinutesAgo, // 30 minutes
      },
    },
  })
}
