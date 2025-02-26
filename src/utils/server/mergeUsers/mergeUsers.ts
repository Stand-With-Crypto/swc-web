import { Prisma } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

import { MERGE_EMAIL_SOURCE_PRIORITY } from './constants'

const logger = getLogger(`mergeUsers`)

export async function mergeUsers({
  userToDeleteId,
  userToKeepId,
  persist,
}: {
  userToKeepId: string
  userToDeleteId: string
  persist: boolean
}) {
  const usersWithData = await prismaClient.user.findMany({
    where: { id: { in: [userToKeepId, userToDeleteId] } },
    include: {
      userCryptoAddresses: true,
      primaryUserEmailAddress: true,
      userEmailAddresses: true,
      userSessions: true,
      userActions: true,
      userMergeEvents: true,
    },
  })
  const userToKeep = usersWithData.find(x => x.id === userToKeepId)!
  const userToDelete = usersWithData.find(x => x.id === userToDeleteId)!

  const shouldTransferAddress = !userToKeep.addressId && userToDelete.addressId

  const emailsToTransfer = userToDelete.userEmailAddresses.filter(userToDeleteEmail => {
    const correspondingEmail = userToKeep.userEmailAddresses.find(
      y => y.emailAddress === userToDeleteEmail.emailAddress,
    )
    if (!correspondingEmail) {
      return true
    }
    if (!correspondingEmail.isVerified && userToDeleteEmail.isVerified) {
      return true
    }
    const userToDeleteEmailSourceIndex = MERGE_EMAIL_SOURCE_PRIORITY.indexOf(
      userToDeleteEmail.source,
    )
    const correspondingEmailSourceIndex = MERGE_EMAIL_SOURCE_PRIORITY.indexOf(
      correspondingEmail.source,
    )
    return userToDeleteEmailSourceIndex < correspondingEmailSourceIndex
  })
  const emailsToDelete = [
    ...userToDelete.userEmailAddresses.filter(x =>
      emailsToTransfer.every(transferEmail => transferEmail.id !== x.id),
    ),
    ...userToKeep.userEmailAddresses.filter(x =>
      emailsToTransfer.find(transfer => transfer.emailAddress === x.emailAddress),
    ),
  ]
  const cryptoAddressesToTransfer = userToDelete.userCryptoAddresses.filter(userToDeleteAddress => {
    const correspondingAddress = userToKeep.userCryptoAddresses.find(
      y => y.cryptoAddress === userToDeleteAddress.cryptoAddress,
    )
    if (!correspondingAddress) {
      return true
    }
    if (
      !correspondingAddress.hasBeenVerifiedViaAuth &&
      userToDeleteAddress.hasBeenVerifiedViaAuth
    ) {
      return true
    }
    return false
  })
  const cryptoAddressesToDelete = [
    ...userToDelete.userCryptoAddresses.filter(x =>
      cryptoAddressesToTransfer.every(transferEmail => transferEmail.id !== x.id),
    ),
    ...userToKeep.userCryptoAddresses.filter(x =>
      cryptoAddressesToTransfer.find(transfer => transfer.cryptoAddress === x.cryptoAddress),
    ),
  ]
  const userCryptoAddressesUpdatePayloads: Prisma.UserCryptoAddressUpdateArgs[] =
    userToDelete.userCryptoAddresses
      .filter(x => cryptoAddressesToDelete.every(deletedAddress => deletedAddress.id !== x.id))
      .map(cryptoAddress => {
        return {
          where: { id: cryptoAddress.id },
          data: {
            userId: userToKeep.id,
          },
        }
      })
  const userSessionsUpdatePayloads = userToDelete.userSessions.map(session => {
    return {
      where: { id: session.id },
      data: {
        userId: userToKeep.id,
      },
    }
  }) satisfies Prisma.UserSessionUpdateArgs[]
  const userActionUpdatePayloads: Prisma.UserActionUpdateArgs[] = userToDelete.userActions.map(
    action => {
      if (action.userEmailAddressId) {
        const deletedEmail = emailsToDelete.find(x => x.id === action.userEmailAddressId)
        if (deletedEmail) {
          const replacementEmail = userToKeep.userEmailAddresses.find(
            x => x.emailAddress === deletedEmail.emailAddress,
          )!
          return {
            where: { id: action.id },
            data: {
              userEmailAddressId: replacementEmail.id,
              userId: userToKeep.id,
            },
          }
        }
      }
      if (action.userCryptoAddressId) {
        const deletedCrypto = cryptoAddressesToDelete.find(x => x.id === action.userCryptoAddressId)
        if (deletedCrypto) {
          const replacementCrypto = userToKeep.userCryptoAddresses.find(
            x => x.cryptoAddress === deletedCrypto.cryptoAddress,
          )!
          return {
            where: { id: action.id },
            data: {
              userCryptoAddressId: replacementCrypto.id,
              userId: userToKeep.id,
            },
          }
        }
      }
      return {
        where: { id: action.id },
        data: {
          userId: userToKeep.id,
        },
      }
    },
  )
  logger.info(`Merging user ${userToDelete.id} into user ${userToKeep.id}`)
  logger.info(`${shouldTransferAddress ? 'Transferring' : 'Not transferring'} address`)
  logger.info(`Transferring ${emailsToTransfer.length} emails`)
  logger.info(`Deleting ${emailsToDelete.length} emails`)
  logger.info(`Deleting ${cryptoAddressesToDelete.length} crypto addresses`)
  logger.info(`Transferring ${userCryptoAddressesUpdatePayloads.length} crypto addresses`)
  logger.info(`Transferring ${userSessionsUpdatePayloads.length} sessions`)
  logger.info(`Transferring ${userActionUpdatePayloads.length} actions to new user`)
  logger.info(
    `${
      userActionUpdatePayloads.filter(x => x.data.userEmailAddressId).length
    } of those actions have swapped new user email addresses`,
  )
  if (!persist) {
    logger.info(`Not persisting changes`)
    return
  }

  await prismaClient.$transaction(
    async client => {
      if (userToDelete.userSessions.length) {
        await client.userSession.updateMany({
          where: { id: { in: userToDelete.userSessions.map(session => session.id) } },
          data: {
            userId: userToKeep.id,
          },
        })
      }

      // Not using `Promise.all` bc we don't have control over how many updates we would be doing
      for (const userActionUpdatePayload of userActionUpdatePayloads) {
        await client.userAction.update(userActionUpdatePayload)
      }

      await client.user.update({
        where: { id: userToDelete.id },
        data: {
          primaryUserCryptoAddressId: null,
          primaryUserEmailAddressId: null,
        },
      })

      const willChangePrimaryEmailAddress = emailsToDelete.some(
        emailToDelete => emailToDelete.id === userToKeep.primaryUserEmailAddressId,
      )
      const userToKeepPrimaryEmailAddress = userToKeep.primaryUserEmailAddress
      if (willChangePrimaryEmailAddress && userToKeepPrimaryEmailAddress) {
        const newPrimaryEmailAddress = emailsToTransfer.find(
          email => email.emailAddress === userToKeepPrimaryEmailAddress.emailAddress,
        )

        if (newPrimaryEmailAddress) {
          await client.user.update({
            where: { id: userToKeep.id },
            data: {
              primaryUserEmailAddressId: newPrimaryEmailAddress.id,
            },
          })
        }
      }

      await client.userEmailAddress.deleteMany({
        where: { id: { in: emailsToDelete.map(e => e.id) } },
      })

      await client.userEmailAddress.updateMany({
        where: { id: { in: emailsToTransfer.map(e => e.id) } },
        data: {
          userId: userToKeep.id,
        },
      })

      await client.userCryptoAddress.deleteMany({
        where: { id: { in: cryptoAddressesToDelete.map(c => c.id) } },
      })

      const cryptoAddressesToUpdate = userToDelete.userCryptoAddresses.filter(x =>
        cryptoAddressesToDelete.every(deletedAddress => deletedAddress.id !== x.id),
      )
      if (cryptoAddressesToUpdate.length) {
        await client.userCryptoAddress.updateMany({
          where: {
            id: {
              in: cryptoAddressesToUpdate.map(c => c.id),
            },
          },
          data: {
            userId: userToKeep.id,
          },
        })
      }

      await client.userMergeAlert.deleteMany({
        where: {
          OR: [{ userBId: userToDelete.id }, { userAId: userToDelete.id }],
        },
      })

      await client.user.update({
        where: { id: userToKeep.id },
        data: {
          totalDonationAmountUsd: {
            increment: userToDelete.totalDonationAmountUsd,
          },
        },
      })

      if (shouldTransferAddress) {
        await client.user.update({
          where: { id: userToKeep.id },
          data: {
            addressId: userToDelete.addressId,
          },
        })
      }

      await client.userCommunicationJourney.updateMany({
        where: { userId: userToDelete.id },
        data: {
          userId: userToKeep.id,
        },
      })

      await client.user.delete({
        where: { id: userToDelete.id },
      })

      await client.userMergeEvent.create({
        data: {
          userId: userToKeep.id,
        },
      })
    },
    {
      maxWait: 5000,
      timeout: 10000,
    },
  )

  logger.info(`merge of user ${userToDelete.id} into user ${userToKeep.id} complete`)
}
