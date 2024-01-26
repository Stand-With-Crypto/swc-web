import 'dotenv/config'
import { runBin } from '@/bin/runBin'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockAuthenticationNonce } from '@/mocks/models/mockAuthenticationNonce'
import { PopularCryptoAddress, mockUserCryptoAddress } from '@/mocks/models/mockUserCryptoAddress'
import { mockUser } from '@/mocks/models/mockUser'
import { mockUserSession } from '@/mocks/models/mockUserSession'
import { mockUserAction } from '@/mocks/models/mockUserAction'
import { mockUserActionCall } from '@/mocks/models/mockUserActionCall'
import { mockUserActionDonation } from '@/mocks/models/mockUserActionDonation'
import { mockUserActionEmail } from '@/mocks/models/mockUserActionEmail'
import { mockUserActionEmailRecipient } from '@/mocks/models/mockUserActionEmailRecipient'
import { prismaClient } from '@/utils/server/prismaClient'
import { batchAsyncAndLog } from '@/utils/shared/batchAsyncAndLog'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { faker } from '@faker-js/faker'
import _ from 'lodash'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { UserActionType, UserEmailAddressSource } from '@prisma/client'
import { mockUserActionOptIn } from '@/mocks/models/mockUserActionOptIn'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import { mockNFTMint } from '@/mocks/models/mockNFTMint'

const LOCAL_USER_CRYPTO_ADDRESS = requiredEnv(
  process.env.LOCAL_USER_CRYPTO_ADDRESS,
  'process.env.LOCAL_USER_CRYPTO_ADDRESS',
)

enum SeedSize {
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
}

const argv = yargs(hideBin(process.argv)).option('size', {
  type: 'string',
  describe: 'The timestamp of the last updated record',
  choices: Object.values(SeedSize),
  default: SeedSize.MD,
}).argv

const logger = getLogger('seedLocalDb')
const logEntity = (obj: Record<string, any[]>) => {
  const key = Object.keys(obj)[0]
  logger.info(`created ${obj[key].length} ${key}`)
}

async function seed() {
  const { size: seedSize } = await argv
  const seedSizes = (sizes: [number, number, number]) => {
    const [sm, md, lg] = sizes
    switch (seedSize) {
      case SeedSize.SM:
        return sm
      case SeedSize.MD:
        return md
      case SeedSize.LG:
        return lg
    }
  }
  /*
  authenticationNonce
  */
  await batchAsyncAndLog(
    _.times(seedSizes([10, 100, 1000])).map(() => mockAuthenticationNonce()),
    data =>
      prismaClient.authenticationNonce.createMany({
        data,
      }),
  )
  const authenticationNonce = await prismaClient.authenticationNonce.findMany()
  logEntity({ authenticationNonce })
  /*
  user
  */
  await batchAsyncAndLog(
    _.times(seedSizes([10, 100, 1000])).map(() => mockUser()),
    data =>
      prismaClient.user.createMany({
        data,
      }),
  )
  const user = await prismaClient.user.findMany()
  logEntity({ user })
  /*
  userSession
  */
  await batchAsyncAndLog(
    _.times(user.length * 2).map(() => ({
      ...mockUserSession(),
      userId: faker.helpers.arrayElement(user).id,
    })),
    data =>
      prismaClient.userSession.createMany({
        data,
      }),
  )
  const userSession = await prismaClient.userSession.findMany()
  logEntity({ userSession })
  const usersUnusedOnCryptoAddress = [...user]

  /*
  userEmailAddress
  */
  await batchAsyncAndLog(
    _.times(user.length / 2).map(() => ({
      ...mockUserEmailAddress(),
      userId: faker.helpers.arrayElement(user).id,
    })),
    data =>
      prismaClient.userEmailAddress.createMany({
        data,
      }),
  )
  const userEmailAddress = await prismaClient.userEmailAddress.findMany()
  logEntity({ userEmailAddress })

  /*
  userCryptoAddress
  */
  const topDonorCryptoAddressStrings = [
    PopularCryptoAddress.BRIAN_ARMSTRONG,
    PopularCryptoAddress.CHRIS_DIXON,
  ]
  const initialCryptoAddresses = [...topDonorCryptoAddressStrings, LOCAL_USER_CRYPTO_ADDRESS]
  const emailAddressesToRelateToEmbeddedWallets = userEmailAddress.filter(
    x => x.source === UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH,
  )
  await batchAsyncAndLog(
    _.times(user.length / 2).map(() => {
      // a crypto user address must only ever be associated with one user so we use splice here to ensure we can randomly assign these models to users without any duplicates
      const selectedUser = usersUnusedOnCryptoAddress.splice(
        faker.number.int({ min: 0, max: usersUnusedOnCryptoAddress.length - 1 }),
        1,
      )[0]
      // we want all known ENS addresses to not have a full name so we always display their ENS
      // in the testing environment. This lets us verify our onchain integrations are working easily
      const shouldUseInitialCryptoAddress =
        initialCryptoAddresses.length && !selectedUser.firstName && selectedUser.isPubliclyVisible
      return {
        ...mockUserCryptoAddress(),
        embeddedWalletUserEmailAddressId:
          !shouldUseInitialCryptoAddress && emailAddressesToRelateToEmbeddedWallets.length
            ? emailAddressesToRelateToEmbeddedWallets.splice(
                faker.number.int({
                  min: 0,
                  max: emailAddressesToRelateToEmbeddedWallets.length - 1,
                }),
                1,
              )[0].id
            : null,
        cryptoAddress: shouldUseInitialCryptoAddress
          ? initialCryptoAddresses.pop()!
          : faker.finance.ethereumAddress(),
        userId: selectedUser.id,
      }
    }),
    data =>
      prismaClient.userCryptoAddress.createMany({
        data,
      }),
  )
  const userCryptoAddress = await prismaClient.userCryptoAddress.findMany()
  const localUserCryptoAddress = userCryptoAddress.find(
    x => x.cryptoAddress === LOCAL_USER_CRYPTO_ADDRESS,
  )!
  const topDonorCryptoAddresses = userCryptoAddress.filter(x =>
    topDonorCryptoAddressStrings.includes(x.cryptoAddress),
  )!
  logEntity({ userCryptoAddress })
  batchAsyncAndLog(userCryptoAddress, addresses =>
    Promise.all(
      addresses.map(x =>
        prismaClient.user.update({
          where: { id: x.userId },
          data: { primaryUserCryptoAddressId: x.id },
        }),
      ),
    ),
  )
  logger.info(
    `backfilled newly created userCryptoAddress in to users with primaryUserCryptoAddressId`,
  )

  /*
      Create a situation where the LOCAL_USER_CRYPTO_ADDRESS has a UserMergeAlert
  */
  const otherUserToMerge = faker.helpers.arrayElement(
    user.filter(x => x.id !== localUserCryptoAddress.userId),
  )
  const emailAddress = faker.internet.email()
  await prismaClient.userEmailAddress.createMany({
    data: [otherUserToMerge.id, localUserCryptoAddress.userId].map(userId => ({
      userId,
      emailAddress: emailAddress,
      isVerified: true,
      source: UserEmailAddressSource.USER_ENTERED,
    })),
  })
  await prismaClient.userMergeAlert.create({
    data: {
      userAId: otherUserToMerge.id,
      userBId: localUserCryptoAddress.userId,
      hasBeenConfirmedByUserA: true,
    },
  })

  /*
  userAction
  */
  const userActionTypes = Object.values(UserActionType)
  const userActionTypesToPersist = _.times(seedSizes([400, 4000, 40000])).map(index => {
    return userActionTypes[index % userActionTypes.length]
  })

  /*
  NFTMint
  */
  await batchAsyncAndLog(
    userActionTypesToPersist
      .filter(x => x === UserActionType.NFT_MINT)
      .map(() => {
        return mockNFTMint()
      }),
    data =>
      prismaClient.nFTMint.createMany({
        data,
      }),
  )
  const nftMint = await prismaClient.nFTMint.findMany()
  logEntity({ nftMint })

  const usedNftMints = [...nftMint]

  const topDonorsLeftToAssign = [...topDonorCryptoAddresses]
  await batchAsyncAndLog(
    userActionTypesToPersist.map((actionType, index) => {
      const getRelatedItem = () => {
        if (actionType === UserActionType.OPT_IN) {
          return faker.helpers.arrayElement(userEmailAddress)
        }
        if (index < 10) {
          return localUserCryptoAddress
        }
        if (actionType === UserActionType.DONATION && topDonorsLeftToAssign.length) {
          return topDonorsLeftToAssign.pop()!
        }
        if (index % 4 === 1) {
          return faker.helpers.arrayElement(userSession)
        }
        return faker.helpers.arrayElement(userCryptoAddress)
      }
      const relatedItem = getRelatedItem()

      return {
        ...mockUserAction({
          actionType,
          userCryptoAddressId:
            actionType === UserActionType.OPT_IN
              ? null
              : 'cryptoAddress' in relatedItem
                ? relatedItem.id
                : null,
          userSessionId:
            actionType === UserActionType.OPT_IN
              ? null
              : 'cryptoAddress' in relatedItem
                ? null
                : relatedItem.id,
          userEmailAddressId: actionType === UserActionType.OPT_IN ? relatedItem.id : null,
        }),
        userId: relatedItem.userId,
        // a nft mint must only ever be associated with one action so we use splice here to ensure we can randomly assign these models to users without any duplicates
        nftMintId:
          actionType === UserActionType.NFT_MINT
            ? usedNftMints.splice(faker.number.int({ min: 0, max: usedNftMints.length - 1 }), 1)[0]
                .id
            : null,
      }
    }),
    data =>
      prismaClient.userAction.createMany({
        data,
      }),
  )
  const userAction = await prismaClient.userAction.findMany()
  logEntity({ userAction })

  const userActionsByType = _.groupBy(userAction, x => x.actionType) as Record<
    UserActionType,
    typeof userAction
  >
  /*
  address
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.EMAIL].map(() => mockAddress()),
    data =>
      prismaClient.address.createMany({
        data,
      }),
  )
  const address = await prismaClient.address.findMany()
  logEntity({ address })

  /*
  userActionEmail
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.EMAIL].map(action => ({
      ...mockUserActionEmail(),
      id: action.id,
      addressId: faker.helpers.arrayElement(address).id,
    })),
    data =>
      prismaClient.userActionEmail.createMany({
        data,
      }),
  )
  const userActionEmail = await prismaClient.userActionEmail.findMany()
  logEntity({ userActionEmail })
  /*
  userActionEmailRecipient
  */
  await batchAsyncAndLog(
    _.flatten(
      userActionsByType[UserActionType.EMAIL].map(actionEmail =>
        // LATER-TASK expand this to be more than 1 recipient once we have UX
        _.times(faker.helpers.arrayElement([1])).map(() => ({
          ...mockUserActionEmailRecipient(),
          userActionEmailId: actionEmail.id,
        })),
      ),
    ),
    data =>
      prismaClient.userActionEmailRecipient.createMany({
        data,
      }),
  )
  const userActionEmailRecipient = await prismaClient.userActionEmailRecipient.findMany()
  logEntity({ userActionEmailRecipient })
  /*
  userActionCall
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.CALL].map(action => ({
      ...mockUserActionCall(),
      id: action.id,
      addressId: faker.helpers.arrayElement(address).id,
    })),
    data =>
      prismaClient.userActionCall.createMany({
        data,
      }),
  )
  const userActionCall = await prismaClient.userActionCall.findMany()
  logEntity({ userActionCall })

  /*
  userActionDonation
  */
  const topDonorUserIdMap = _.keyBy(topDonorCryptoAddresses, x => x.userId)
  await batchAsyncAndLog(
    userActionsByType[UserActionType.DONATION].map(action => {
      const initialMockValues = mockUserActionDonation()
      const isTopDonor = topDonorUserIdMap[action.userId]
      const amount = isTopDonor
        ? faker.number.float({ min: 100000, max: 200000, precision: 0.01 })
        : initialMockValues.amount
      return {
        ...initialMockValues,
        amount,
        amountCurrencyCode: isTopDonor ? 'USD' : initialMockValues.amountCurrencyCode,
        amountUsd: isTopDonor ? amount : initialMockValues.amountUsd,
        id: action.id,
      }
    }),
    data =>
      prismaClient.userActionDonation.createMany({
        data,
      }),
  )
  const userActionDonation = await prismaClient.userActionDonation.findMany()
  logEntity({ userActionDonation })

  /*
  userActionOptIn
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.OPT_IN].map(action => {
      return {
        ...mockUserActionOptIn(),
        id: action.id,
      }
    }),
    data =>
      prismaClient.userActionOptIn.createMany({
        data,
      }),
  )
  const userActionOptIn = await prismaClient.userActionOptIn.findMany()
  logEntity({ userActionOptIn })
}

runBin(seed)
