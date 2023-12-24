import 'dotenv/config'
import { runBin } from '@/bin/binUtils'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockAuthenticationNonce } from '@/mocks/models/mockAuthenticationNonce'
import { mockUserCryptoAddress } from '@/mocks/models/mockUserCryptoAddress'
import { mockUser } from '@/mocks/models/mockUser'
import { mockNFT } from '@/mocks/models/mockNFT'
import { mockUserSession } from '@/mocks/models/mockUserSession'
import { mockUserAction } from '@/mocks/models/mockUserAction'
import { mockUserActionCall } from '@/mocks/models/mockUserActionCall'
import { mockUserActionDonation } from '@/mocks/models/mockUserActionDonation'
import { mockUserActionEmail } from '@/mocks/models/mockUserActionEmail'
import { mockUserActionEmailRecipient } from '@/mocks/models/mockUserActionEmailRecipient'
import { prismaClient } from '@/utils/server/prismaClient'
import { batchAsyncAndLog } from '@/utils/shared/batchAsyncAndLog'
import { MOCK_CURRENT_ETH_USD_EXCHANGE_RATE } from '@/utils/shared/exchangeRate'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { splitArray } from '@/utils/shared/splitArray'
import { faker } from '@faker-js/faker'
import _ from 'lodash'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { UserActionType } from '@prisma/client'
import { mockUserActionOptIn } from '@/mocks/models/mockUserActionOptIn'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'

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
  userCryptoAddress
  */
  await batchAsyncAndLog(
    _.times(user.length / 2).map(index => ({
      ...mockUserCryptoAddress(),
      address: index === 0 ? LOCAL_USER_CRYPTO_ADDRESS : faker.finance.ethereumAddress(),
      // a crypto user address must only ever be associated with one user so we use splice here to ensure we can randomly assign these models to users without any duplicates
      userId: usersUnusedOnCryptoAddress.splice(
        faker.number.int({ min: 0, max: usersUnusedOnCryptoAddress.length - 1 }),
        1,
      )[0].id,
    })),
    data =>
      prismaClient.userCryptoAddress.createMany({
        data,
      }),
  )
  const userCryptoAddress = await prismaClient.userCryptoAddress.findMany()
  const localUserCryptoAddress = userCryptoAddress.find(
    x => x.address === LOCAL_USER_CRYPTO_ADDRESS,
  )!
  logEntity({ userCryptoAddress })

  /*
  userEmailAddress
  */
  await batchAsyncAndLog(
    _.times(user.length / 2).map(index => ({
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
  nft
  */
  await batchAsyncAndLog(
    _.times(seedSizes([5, 10, 15])).map(() => mockNFT()),
    data =>
      prismaClient.nFT.createMany({
        data,
      }),
  )
  const nft = await prismaClient.nFT.findMany()
  logEntity({ nft })
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
      .map(index => {
        const selectedNFT = faker.helpers.arrayElement(nft)
        return {
          nftId: selectedNFT.id,
          costAtMint: selectedNFT.cost,
          costAtMintCurrencyCode: selectedNFT.costCurrencyCode,
          costAtMintUsd: selectedNFT.cost.times(MOCK_CURRENT_ETH_USD_EXCHANGE_RATE),
        }
      }),
    data =>
      prismaClient.nFTMint.createMany({
        data,
      }),
  )
  const nftMint = await prismaClient.nFTMint.findMany()
  logEntity({ nftMint })

  const usedNftMints = [...nftMint]
  console.log('start', usedNftMints.length)

  await batchAsyncAndLog(
    userActionTypesToPersist.map((actionType, index) => {
      const relatedItem =
        actionType === UserActionType.OPT_IN
          ? faker.helpers.arrayElement(userEmailAddress)
          : index < 10
            ? localUserCryptoAddress
            : index % 4 === 1
              ? faker.helpers.arrayElement(userSession)
              : faker.helpers.arrayElement(userCryptoAddress)
      console.log(usedNftMints.length)
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
    userActionsByType[UserActionType.EMAIL].map((action, index) => ({
      ...mockUserActionEmail(),
      id: action.id,
      addressId: address[index].id,
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
      userActionsByType[UserActionType.EMAIL].map((actionEmail, index) =>
        // TODO expand this to be more than 1 recipient once we have UX
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
    userActionsByType[UserActionType.CALL].map((action, index) => ({
      ...mockUserActionCall(),
      id: action.id,
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
  await batchAsyncAndLog(
    userActionsByType[UserActionType.DONATION].map((action, index) => {
      return {
        ...mockUserActionDonation(),
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
    userActionsByType[UserActionType.OPT_IN].map((action, index) => {
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
