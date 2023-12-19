import './binEnv'
import { runBin } from '@/bin/binUtils'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockAuthenticationNonce } from '@/mocks/models/mockAuthenticationNonce'
import { mockCryptoAddressUser } from '@/mocks/models/mockCryptoAddressUser'
import { mockInferredUser } from '@/mocks/models/mockInferredUser'
import { mockNonFungibleToken } from '@/mocks/models/mockNonFungibleToken'
import { mockSessionUser } from '@/mocks/models/mockSessionUser'
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
  default: SeedSize.SM,
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
  inferredUser
  */
  await batchAsyncAndLog(
    _.times(seedSizes([10, 100, 1000])).map(() => mockInferredUser()),
    data =>
      prismaClient.inferredUser.createMany({
        data,
      }),
  )
  const inferredUser = await prismaClient.inferredUser.findMany()
  logEntity({ inferredUser })
  /*
  sessionUser
  */
  await batchAsyncAndLog(
    _.times(seedSizes([100, 1000, 10000])).map(() => ({
      ...mockSessionUser(),
      inferredUserId: faker.helpers.maybe(() => faker.helpers.arrayElement(inferredUser).id),
    })),
    data =>
      prismaClient.sessionUser.createMany({
        data,
      }),
  )
  const sessionUser = await prismaClient.sessionUser.findMany()
  logEntity({ sessionUser })
  /*
  cryptoAddressUser
  */
  await batchAsyncAndLog(
    _.times(seedSizes([100, 1000, 10000])).map(index => ({
      ...mockCryptoAddressUser(),
      address: index === 0 ? LOCAL_USER_CRYPTO_ADDRESS : faker.finance.ethereumAddress(),
      inferredUserId: faker.helpers.arrayElement(inferredUser).id,
    })),
    data =>
      prismaClient.cryptoAddressUser.createMany({
        data,
      }),
  )
  const cryptoAddressUser = await prismaClient.cryptoAddressUser.findMany()
  logEntity({ cryptoAddressUser })
  /*
  userAction
  */
  await batchAsyncAndLog(
    _.times(seedSizes([400, 4000, 40000])).map(index => {
      const user =
        index % 2
          ? faker.helpers.arrayElement(cryptoAddressUser)
          : faker.helpers.arrayElement(sessionUser)

      return {
        ...mockUserAction(),
        cryptoAddressUserId: 'address' in user ? user.id : null,
        sessionUserId: 'address' in user ? null : user.id,
        inferredUserId: user.inferredUserId,
      }
    }),
    data =>
      prismaClient.userAction.createMany({
        data,
      }),
  )
  const userAction = await prismaClient.userAction.findMany()
  logEntity({ userAction })

  const [
    userActionEmailInput,
    userActionCallInput,
    userActionDonationInput,
    userActionNFTMintInput,
    userActionTweetInput,
  ] = splitArray(userAction, 5)
  /*
  address
  */
  await batchAsyncAndLog(
    userActionEmailInput.map(() => mockAddress()),
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
    userActionEmailInput.map((action, index) => ({
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
      userActionEmailInput.map((actionEmail, index) =>
        _.times(faker.helpers.arrayElement([1, 3, 5])).map(() => ({
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
    userActionCallInput.map((action, index) => ({
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
  nonFungibleToken
  */
  await batchAsyncAndLog(
    _.times(seedSizes([5, 10, 15])).map(() => mockNonFungibleToken()),
    data =>
      prismaClient.nonFungibleToken.createMany({
        data,
      }),
  )
  const nonFungibleToken = await prismaClient.nonFungibleToken.findMany()
  logEntity({ nonFungibleToken })
  /*
  userActionNFTMint
  */
  await batchAsyncAndLog(
    userActionNFTMintInput.map((action, index) => {
      const nft = faker.helpers.arrayElement(nonFungibleToken)
      return {
        id: action.id,
        nftId: nft.id,
        costAtMint: nft.cost,
        costAtMintCurrencyCode: nft.costCurrencyCode,
        constAtMintUsd: nft.cost.times(MOCK_CURRENT_ETH_USD_EXCHANGE_RATE),
      }
    }),
    data =>
      prismaClient.userActionNFTMint.createMany({
        data,
      }),
  )
  const userActionNFTMint = await prismaClient.userActionNFTMint.findMany()
  logEntity({ userActionNFTMint })

  /*
  userActionTweet
  */
  await batchAsyncAndLog(
    userActionTweetInput.map((action, index) => {
      return {
        id: action.id,
      }
    }),
    data =>
      prismaClient.userActionTweet.createMany({
        data,
      }),
  )
  const userActionTweet = await prismaClient.userActionTweet.findMany()
  logEntity({ userActionTweet })

  /*
  userActionDonation
  */
  await batchAsyncAndLog(
    userActionDonationInput.map((action, index) => {
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
}

runBin(seed)
