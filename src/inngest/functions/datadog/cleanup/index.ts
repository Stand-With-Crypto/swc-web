import {
  User,
  UserAction,
  UserActionType,
  UserCryptoAddress,
  UserEmailAddress,
} from '@prisma/client'
import { differenceInMinutes } from 'date-fns'
import { difference, flatten, uniqBy } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'

type UserWithRelations = User & {
  userActions: UserAction[]
  userEmailAddresses: UserEmailAddress[]
  userCryptoAddresses: UserCryptoAddress[]
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
          userCryptoAddresses: true,
        },
      })

      const filteredUsers = uniqBy(users, user => user.id)

      if (filteredUsers.length === 0) {
        return { usersFound: 0 }
      }

      const emailAddressesCreatedInLast1HourIds = flatten(
        filteredUsers.map(user => {
          return user.userEmailAddresses
            .filter(
              userEmail =>
                userEmail.emailAddress.includes(DATADOG_SYNTHETIC_TESTS_EMAIL_DOMAIN) &&
                differenceInMinutes(new Date(), userEmail.datetimeCreated.getTime()) <= 60,
            )
            .map(userEmail => userEmail.id)
        }),
      )

      await step.run('script.updateUsers', () =>
        Promise.all(
          filteredUsers.map(user => updateUser(user, emailAddressesCreatedInLast1HourIds)),
        ),
      )

      await step.run('script.removeUserActions', () =>
        Promise.all(filteredUsers.map(removeUserActions)),
      )

      await step.run('script.removeUserEmails', () =>
        Promise.all(
          filteredUsers.map(user => removeUserEmails(user, emailAddressesCreatedInLast1HourIds)),
        ),
      )

      await step.run('script.removeUserCryptoAddresses', () =>
        Promise.all(filteredUsers.map(removeUserCryptoAdresses)),
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

async function updateUser(user: User, emailAddressesCreatedInLast1HourIds: string[]) {
  const primaryUserEmailAddressId = user.primaryUserEmailAddressId

  if (!primaryUserEmailAddressId) return

  const isPrimaryEmailCreatedInLast1Hour =
    emailAddressesCreatedInLast1HourIds.includes(primaryUserEmailAddressId)

  if (isPrimaryEmailCreatedInLast1Hour) return

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
  emailAddressesCreatedInLast1HourIds: string[],
) {
  const primaryUserEmailAddressId = user.primaryUserEmailAddressId

  const userEmailIds = user.userEmailAddresses.map(userEmail => userEmail.id)

  // We only want to delete emails that were created more than 1 hour ago
  // This approach prevents any potential bugs from deleting emails while the synthetic tests are running.
  const emailIdsToRemove = difference(userEmailIds, emailAddressesCreatedInLast1HourIds)

  // Remove the primary email id from the list of emails to remove
  const filteredIds = emailIdsToRemove.filter(id => id !== primaryUserEmailAddressId)

  return prismaClient.userEmailAddress.deleteMany({
    where: {
      id: { in: filteredIds },
    },
  })
}

async function removeUserCryptoAdresses(user: UserWithRelations) {
  const userCryptoAddresses = user.userCryptoAddresses.map(cryptoAddress => cryptoAddress.id)

  const mainUserCryptoAddressId = user.primaryUserCryptoAddressId

  const filteredUserCryptoAddresses = userCryptoAddresses.filter(
    cryptoAddress => cryptoAddress !== mainUserCryptoAddressId,
  )

  return prismaClient.userCryptoAddress.deleteMany({
    where: {
      id: { in: filteredUserCryptoAddresses },
    },
  })
}
