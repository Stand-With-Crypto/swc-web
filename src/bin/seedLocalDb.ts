import 'dotenv/config'
import { runBin } from '@/bin/binUtils'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockAuthenticationNonce } from '@/mocks/models/mockAuthenticationNonce'
import { mockCryptoAddressUser } from '@/mocks/models/mockCryptoAddressUser'
import { mockInferredUser } from '@/mocks/models/mockInferredUser'
import { mockNFT } from '@/mocks/models/mockNFT'
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
import { UserActionType } from '@prisma/client'
import { mockUserActionOptIn } from '@/mocks/models/mockUserActionOptIn'

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
      cryptoAddress: index === 0 ? LOCAL_USER_CRYPTO_ADDRESS : faker.finance.ethereumAddress(),
      inferredUserId: faker.helpers.arrayElement(inferredUser).id,
    })),
    data =>
      prismaClient.cryptoAddressUser.createMany({
        data,
      }),
  )
  const cryptoAddressUser = await prismaClient.cryptoAddressUser.findMany()
  const cryptoAddressLocalUser = cryptoAddressUser.find(
    x => x.cryptoAddress === LOCAL_USER_CRYPTO_ADDRESS,
  )!
  logEntity({ cryptoAddressUser })
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
  await batchAsyncAndLog(
    _.times(seedSizes([400, 4000, 40000])).map(index => {
      const user =
        index < 10
          ? cryptoAddressLocalUser
          : index % 2
            ? faker.helpers.arrayElement(cryptoAddressUser)
            : faker.helpers.arrayElement(sessionUser)

      return {
        ...mockUserAction(),
        actionType: userActionTypes[index % userActionTypes.length],
        cryptoAddressUserId: 'cryptoAddress' in user ? user.id : null,
        sessionUserId: 'cryptoAddress' in user ? null : user.id,
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

  const userActionsByType = _.groupBy(userAction, x => x.actionType) as Record<
    UserActionType,
    typeof userAction
  >
  /*
  NFTMint
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.NFT_MINT].map((action, index) => {
      const selectedNFT = faker.helpers.arrayElement(nft)
      return {
        id: action.id,
        nftId: selectedNFT.id,
        costAtMint: selectedNFT.cost,
        costAtMintCurrencyCode: selectedNFT.costCurrencyCode,
        constAtMintUsd: selectedNFT.cost.times(MOCK_CURRENT_ETH_USD_EXCHANGE_RATE),
      }
    }),
    data =>
      prismaClient.nFTMint.createMany({
        data,
      }),
  )
  const nftMint = await prismaClient.nFTMint.findMany()
  logEntity({ nftMint })

  // add these nft mints to the nft userAction NFT mints
  for (let i = 0; i < nftMint.length; i++) {
    const nftMintRecord = nftMint[i]
    const userActionRecord = userActionsByType[UserActionType.NFT_MINT][i]
    await prismaClient.userAction.update({
      where: { id: userActionRecord.id },
      data: {
        nftMintId: nftMintRecord.id,
      },
    })
    // update in memory as well
    userActionRecord.nftMintId = nftMintRecord.id
  }

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
