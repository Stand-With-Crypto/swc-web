import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import _ from 'lodash'

const logger = getLogger(`maybeCreateMergeAlertAfterEmailVerification`)

/*
Logic that occurs anytime a users email is verified and the user previously existed
*/
// LATER-TASK integrate with logic that deals with verified emails being persisted to db

export async function maybeCreateMergeAlertAfterEmailVerification(userEmailAddressId: string) {
  const user = await prismaClient.user.findFirstOrThrow({
    include: {
      userEmailAddresses: true,
      userMergeAlertUserA: true,
      userMergeAlertUserB: true,
    },
    where: {
      userEmailAddresses: { some: { id: userEmailAddressId } },
    },
  })
  const userEmailAddress = user.userEmailAddresses.find(x => x.id !== userEmailAddressId)!
  if (!userEmailAddress.isVerified) {
    throw new Error(`userEmailAddress ${userEmailAddressId} is not verified`)
  }
  const maybeMatchUsers = await prismaClient.user.findMany({
    where: {
      id: { not: user.id },
      userEmailAddresses: {
        some: { emailAddress: userEmailAddress.emailAddress, isVerified: true },
      },
    },
  })
  if (!maybeMatchUsers.length) {
    logger.info(
      `no additional users found with verified email address ${userEmailAddress.emailAddress}`,
    )
    return
  }
  logger.info(
    `found ${maybeMatchUsers.length} users with verified email address ${userEmailAddress.emailAddress}`,
  )
  const existingMatchUserIds = _.uniq([
    ...user.userMergeAlertUserA.map(x => x.userBId),
    ...user.userMergeAlertUserB.map(x => x.userAId),
  ])
  logger.info(
    `found ${
      existingMatchUserIds.length
    } other users with existing matches: ${existingMatchUserIds.join(`, `)}`,
  )
  const mayBeMatchUsersWithoutExistingMatch = maybeMatchUsers.filter(
    x => !existingMatchUserIds.includes(x.id),
  )
  if (!mayBeMatchUsersWithoutExistingMatch.length) {
    logger.info(`no additional users found without existing matches`)
    return
  }
  logger.info(
    `found ${
      mayBeMatchUsersWithoutExistingMatch.length
    } users without existing matches: ${mayBeMatchUsersWithoutExistingMatch
      .map(x => x.id)
      .join(`, `)}`,
  )
  const userMergeAlerts = await prismaClient.userMergeAlert.createMany({
    data: mayBeMatchUsersWithoutExistingMatch.map(x => ({
      userAId: user.id,
      userBId: x.id,
    })),
  })
  return userMergeAlerts
}
