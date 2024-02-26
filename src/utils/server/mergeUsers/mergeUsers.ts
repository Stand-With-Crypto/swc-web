import { Prisma } from '@prisma/client'
import { isNil } from 'lodash-es'

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

  console.log({
    'userToKeep.id': userToKeep.id,
    'userToDelete.id': userToDelete.id,
  })

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

  // SUCCESS
  // {
  //   emailsToTransfer: [],
  //   emailsToDelete: [
  //     {
  //       id: '4a8ced76-5f31-4878-a068-fe63fad0fd15',
  //       isVerified: false,
  //       emailAddress: 'Enola_Mayer@gmail.com',
  //       userId: '3dab1e71-8858-479d-a833-d3748dacb8a4',
  //       source: 'USER_ENTERED',
  //       dataCreationMethod: 'INITIAL_BACKFILL',
  //       datetimeUpdated: 2024-02-26T19:10:56.419Z,
  //       datetimeCreated: 2024-02-26T19:10:56.419Z
  //     }
  //   ],
  //   'userToKeep.userEmailAddresses': [
  //     {
  //       id: '0bbf39e2-459b-4139-a81f-42a01dcd7841',
  //       isVerified: false,
  //       emailAddress: 'Enola_Mayer@gmail.com',
  //       userId: '21fee83a-af2c-4e77-876d-0f0b2fc73991',
  //       source: 'USER_ENTERED',
  //       dataCreationMethod: 'INITIAL_BACKFILL',
  //       datetimeUpdated: 2024-02-26T19:10:58.415Z,
  //       datetimeCreated: 2024-02-26T19:10:58.415Z
  //     }
  //   ]
  // }

  // ERROR
  // {
  //   emailsToTransfer: [
  //     {
  //       id: '39940b64-605c-4fe5-803f-37986942e572',
  //       isVerified: false,
  //       emailAddress: 'Carlos_Watsica@yahoo.com',
  //       userId: 'fc88d774-6c92-486b-85db-4d61625759b1',
  //       source: 'VERIFIED_THIRD_PARTY',
  //       dataCreationMethod: 'INITIAL_BACKFILL',
  //       datetimeUpdated: 2024-02-26T19:09:43.645Z,
  //       datetimeCreated: 2024-02-26T19:09:43.645Z
  //     }
  //   ],
  //   emailsToDelete: [
  //     {
  //       id: 'ce5e81fe-3929-427c-9d72-d637b8fa7c8f',
  //       isVerified: false,
  //       emailAddress: 'Carlos_Watsica@yahoo.com',
  //       userId: 'acb32d7a-08be-4796-be18-1e28d9bf8c8b',
  //       source: 'USER_ENTERED',
  //       dataCreationMethod: 'INITIAL_BACKFILL',
  //       datetimeUpdated: 2024-02-26T19:09:45.624Z,
  //       datetimeCreated: 2024-02-26T19:09:45.624Z
  //     }
  //   ],
  //   'userToKeep.userEmailAddresses': [
  //     {
  //       id: 'ce5e81fe-3929-427c-9d72-d637b8fa7c8f',
  //       isVerified: false,
  //       emailAddress: 'Carlos_Watsica@yahoo.com',
  //       userId: 'acb32d7a-08be-4796-be18-1e28d9bf8c8b',
  //       source: 'USER_ENTERED',
  //       dataCreationMethod: 'INITIAL_BACKFILL',
  //       datetimeUpdated: 2024-02-26T19:09:45.624Z,
  //       datetimeCreated: 2024-02-26T19:09:45.624Z
  //     }
  //   ]
  // }
  console.log({
    'userToKeep.primaryUserEmailAddressId': userToKeep.primaryUserEmailAddressId,
    emailsToTransfer,
    emailsToDelete,
    'userToKeep.userEmailAddresses': userToKeep.userEmailAddresses,
    'userToDelete.userEmailAddresses': userToDelete.userEmailAddresses,
  })

  await prismaClient.$transaction(async client => {
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

      console.log({ newPrimaryEmailAddress })
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

    await client.user.delete({
      where: { id: userToDelete.id },
    })

    await client.userMergeEvent.create({
      data: {
        userId: userToKeep.id,
      },
    })
  })

  // await prismaClient.$transaction([
  //   ...emailsToTransfer.map(email => {
  //     return prismaClient.userEmailAddress.update({
  //       where: { id: email.id },
  //       data: {
  //         userId: userToKeep.id,
  //       },
  //     })
  //   }),
  //   ...userSessionsUpdatePayloads.map(x => {
  //     return prismaClient.userSession.update(x)
  //   }),
  //   ...userActionUpdatePayloads.map(x => {
  //     return prismaClient.userAction.update(x)
  //   }),
  //   prismaClient.user.update({
  //     where: { id: userToDelete.id },
  //     data: {
  //       primaryUserCryptoAddressId: null,
  //       primaryUserEmailAddressId: null,
  //     },
  //   }),
  //   ...emailsToDelete.map(email => {
  //     return prismaClient.userEmailAddress.delete({
  //       where: { id: email.id },
  //     })
  //   }),
  //   ...cryptoAddressesToDelete.map(addr => {
  //     return prismaClient.userCryptoAddress.delete({
  //       where: { id: addr.id },
  //     })
  //   }),
  //   ...userCryptoAddressesUpdatePayloads.map(x => {
  //     return prismaClient.userCryptoAddress.update(x)
  //   }),
  //   prismaClient.userMergeAlert.deleteMany({
  //     where: {
  //       OR: [{ userBId: userToDelete.id }, { userAId: userToDelete.id }],
  //     },
  //   }),
  //   prismaClient.user.delete({
  //     where: { id: userToDelete.id },
  //   }),
  //   prismaClient.userMergeEvent.create({
  //     data: {
  //       userId: userToKeep.id,
  //     },
  //   }),
  // ])
  logger.info(`merge of user ${userToDelete.id} into user ${userToKeep.id} complete`)
}
