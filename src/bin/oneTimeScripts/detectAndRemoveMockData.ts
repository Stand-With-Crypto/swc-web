import { UserActionType } from '@prisma/client'
import { compact } from 'lodash-es'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { runBin } from '@/bin/runBin'
import { prismaClient } from '@/utils/server/prismaClient'
import { isMockReferralId } from '@/utils/shared/isMockReferralId'
import { getLogger } from '@/utils/shared/logger'

const params = yargs(hideBin(process.argv)).option('persist', {
  type: 'boolean',
})

const DATETIME_MOCK_DATA_STARTED = new Date('2024-02-23T00:00:00Z')

const logger = getLogger('detectAndRemoveMockData')

async function detectAndRemoveMockData() {
  const { persist } = await params.argv
  logger.info(`started with persist=${persist as any}`)
  const maybePoolOfUsers = await prismaClient.user.findMany({
    where: {
      datetimeCreated: {
        gte: DATETIME_MOCK_DATA_STARTED,
      },
    },
    include: {
      userEmailAddresses: true,
      userSessions: true,
      userCryptoAddresses: true,
      userActions: {
        include: {
          userActionCall: true,
          userActionEmail: {
            include: { userActionEmailRecipients: true },
          },
          userActionDonation: true,
          userActionOptIn: true,
          nftMint: true,
          userActionVoterRegistration: true,
        },
      },
    },
  })
  logger.info(
    `Found ${maybePoolOfUsers.length} users created after ${DATETIME_MOCK_DATA_STARTED.toISOString()}`,
  )
  const mockUsers = maybePoolOfUsers.filter(user => isMockReferralId(user.referralId))
  const userActionVoterRegistrations = compact(
    mockUsers.flatMap(user =>
      user.userActions.flatMap(action => action.userActionVoterRegistration),
    ),
  )
  const nftMints = compact(
    mockUsers.flatMap(user => user.userActions.flatMap(action => action.nftMint)),
  )
  const userActionOptIns = compact(
    mockUsers.flatMap(user => user.userActions.flatMap(action => action.userActionOptIn)),
  )
  const userActionDonations = compact(
    mockUsers.flatMap(user => user.userActions.flatMap(action => action.userActionDonation)),
  )
  const userActionEmails = compact(
    mockUsers.flatMap(user => user.userActions.flatMap(action => action.userActionEmail)),
  )
  const userActionEmailRecipients = compact(
    mockUsers.flatMap(user =>
      user.userActions.flatMap(action => action.userActionEmail?.userActionEmailRecipients),
    ),
  )
  const userActionCalls = compact(
    mockUsers.flatMap(user => user.userActions.flatMap(action => action.userActionCall)),
  )
  const userActions = compact(mockUsers.flatMap(user => user.userActions))
  const userCryptoAddresses = compact(mockUsers.flatMap(user => user.userCryptoAddresses))
  const userSessions = compact(mockUsers.flatMap(user => user.userSessions))
  const userEmailAddresses = compact(mockUsers.flatMap(user => user.userEmailAddresses))

  Object.entries({
    // users
    mockUsers,
    // action relations
    userActionVoterRegistrations,
    nftMints,
    userActionOptIns,
    userActionDonations,
    userActionEmails,
    userActionCalls,
    // nested action relations
    userActionEmailRecipients,
    // actions
    userActions,
    // user relations
    userCryptoAddresses,
    userSessions,
    userEmailAddresses,
  }).forEach(([key, value]) => {
    logger.info(`Found ${value.length} ${key}`)
  })

  const userRelationsCount =
    userCryptoAddresses.length + userEmailAddresses.length + userSessions.length
  logger.info(`${userRelationsCount} user relations`)

  const actionRelationsCount =
    userActionVoterRegistrations.length +
    nftMints.length +
    userActionOptIns.length +
    userActionDonations.length +
    userActionEmails.length +
    userActionCalls.length +
    userActions.filter(x => x.actionType === UserActionType.TWEET).length

  logger.info(`${actionRelationsCount} action relations`)

  // if (actionRelationsCount !== userActions.length) {
  //   throw new Error('userRelationsCount !== userActions.length')
  // }

  // if (userRelationsCount !== mockUsers.length) {
  //   throw new Error('userRelationsCount !== userActions.length')
  // }

  if (!persist) {
    logger.info('Dry run, exiting')
    return
  }

  await prismaClient.$transaction([
    // nullify any fks that will prevent entity tree from being deleted
    prismaClient.user.updateMany({
      where: { id: { in: mockUsers.map(x => x.id) } },
      data: {
        primaryUserCryptoAddressId: null,
        primaryUserEmailAddressId: null,
      },
    }),
    // delete all nested user action relations
    prismaClient.userActionEmailRecipient.deleteMany({
      where: { id: { in: userActionEmailRecipients.map(x => x.id) } },
    }),
    // delete all user action relations
    prismaClient.userActionVoterRegistration.deleteMany({
      where: { id: { in: userActionVoterRegistrations.map(x => x.id) } },
    }),
    prismaClient.nFTMint.deleteMany({ where: { id: { in: nftMints.map(x => x.id) } } }),
    prismaClient.userActionOptIn.deleteMany({
      where: { id: { in: userActionOptIns.map(x => x.id) } },
    }),
    prismaClient.userActionDonation.deleteMany({
      where: { id: { in: userActionDonations.map(x => x.id) } },
    }),
    prismaClient.userActionEmail.deleteMany({
      where: { id: { in: userActionEmails.map(x => x.id) } },
    }),
    prismaClient.userActionCall.deleteMany({
      where: { id: { in: userActionCalls.map(x => x.id) } },
    }),
    // delete user actions
    prismaClient.userAction.deleteMany({ where: { id: { in: userActions.map(x => x.id) } } }),
    // delete user relations
    prismaClient.userCryptoAddress.deleteMany({
      where: { id: { in: userCryptoAddresses.map(x => x.id) } },
    }),
    prismaClient.userSession.deleteMany({ where: { id: { in: userSessions.map(x => x.id) } } }),
    prismaClient.userEmailAddress.deleteMany({
      where: { id: { in: userEmailAddresses.map(x => x.id) } },
    }),
    // delete users
    prismaClient.user.deleteMany({ where: { id: { in: mockUsers.map(x => x.id) } } }),
  ])
}

runBin(detectAndRemoveMockData)
