import 'dotenv/config'

import { faker } from '@faker-js/faker'
import { UserActionType, UserEmailAddressSource, UserInformationVisibility } from '@prisma/client'
import { flatten, groupBy, keyBy, times } from 'lodash-es'

import { runBin } from '@/bin/runBin'
import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { mockCreateAddressInput } from '@/mocks/models/mockAddress'
import { mockCreateAuthenticationNonceInput } from '@/mocks/models/mockAuthenticationNonce'
import { mockCreateNFTMintInput } from '@/mocks/models/mockNFTMint'
import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserActionInput } from '@/mocks/models/mockUserAction'
import { mockCreateUserActionCallInput } from '@/mocks/models/mockUserActionCall'
import { mockCreateUserActionDonationInput } from '@/mocks/models/mockUserActionDonation'
import { mockCreateUserActionEmailInput } from '@/mocks/models/mockUserActionEmail'
import { mockCreateUserActionEmailRecipientInput } from '@/mocks/models/mockUserActionEmailRecipient'
import { mockCreateUserActionOptInInput } from '@/mocks/models/mockUserActionOptIn'
import { mockCreateUserActionPollInput } from '@/mocks/models/mockUserActionPoll'
import { mockCreateUserActionPollAnswerInput } from '@/mocks/models/mockUserActionPollAnswer'
import { mockCreateUserActionReferInput } from '@/mocks/models/mockUserActionRefer'
import { mockCreateUserActionRsvpEventInput } from '@/mocks/models/mockUserActionRsvpEvent'
import { mockUserActionTweetAtPersonInput } from '@/mocks/models/mockUserActionTweetAtPerson'
import { mockCreateUserActionViewKeyRacesInput } from '@/mocks/models/mockUserActionViewKeyRaces'
import { mockCreateUserActionVoterAttestationInput } from '@/mocks/models/mockUserActionVoterAttestation'
import { mockCreateUserActionVoterRegistrationInput } from '@/mocks/models/mockUserActionVoterRegistration'
import { mockCreateUserActionVotingDayInput } from '@/mocks/models/mockUserActionVotingDay'
import { mockCreateUserActionVotingInformationResearchedInput } from '@/mocks/models/mockUserActionVotingInformationResearched'
import {
  mockCreateUserCryptoAddressInput,
  PopularCryptoAddress,
} from '@/mocks/models/mockUserCryptoAddress'
import { mockCreateUserEmailAddressInput } from '@/mocks/models/mockUserEmailAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { batchAsyncAndLog } from '@/utils/shared/batchAsyncAndLog'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import {
  ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  UserActionPollCampaignName,
} from '@/utils/shared/userActionCampaigns'

const LOCAL_USER_CRYPTO_ADDRESS = parseThirdwebAddress(
  requiredEnv(process.env.LOCAL_USER_CRYPTO_ADDRESS, 'LOCAL_USER_CRYPTO_ADDRESS'),
)

enum SeedSize {
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
}

const logger = getLogger('seedLocalDb')
const logEntity = (obj: Record<string, any[]>) => {
  const key = Object.keys(obj)[0]
  logger.info(`created ${obj[key].length} ${key}`)
}

async function seed() {
  const seedSize = process.env.SEED_SIZE || SeedSize.MD
  const seedSizes = (sizes: [number, number, number]) => {
    const [sm, md, lg] = sizes
    switch (seedSize) {
      case SeedSize.SM:
        return sm
      case SeedSize.MD:
        return md
      case SeedSize.LG:
        return lg
      default:
        throw new Error(`Invalid seed size passed: ${seedSize}`)
    }
  }

  /*
  address
  */
  await batchAsyncAndLog(
    times(seedSizes([10, 100, 1000])).map(() => {
      const address = mockCreateAddressInput()
      return address
    }),
    data =>
      prismaClient.address.createMany({
        data,
      }),
  )

  const address = await prismaClient.address.findMany()
  logEntity({ address })
  /*
  authenticationNonce
  */
  await batchAsyncAndLog(
    times(seedSizes([10, 100, 1000])).map(() => mockCreateAuthenticationNonceInput()),
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
  const topDonorCryptoAddressStrings = [
    PopularCryptoAddress.BRIAN_ARMSTRONG,
    PopularCryptoAddress.CHRIS_DIXON,
  ]
  const initialCryptoAddresses = [...topDonorCryptoAddressStrings, LOCAL_USER_CRYPTO_ADDRESS]
  const addressesUnusedOnUsers = [...address]
  await batchAsyncAndLog(
    times(seedSizes([12, 98, 987])).map((_num, index) => {
      // This ensures that no matter how many users we create, we include our initial crypto addresses
      const shouldBeAssociatedWithInitialCryptoAddress = index < initialCryptoAddresses.length
      const mocks = mockCreateUserInput()
      const selectedAddress =
        addressesUnusedOnUsers.length > 1
          ? addressesUnusedOnUsers.splice(
              faker.number.int({ min: 0, max: addressesUnusedOnUsers.length - 1 }),
              1,
            )[0]
          : addressesUnusedOnUsers[0]
      return {
        ...mocks,
        informationVisibility: shouldBeAssociatedWithInitialCryptoAddress
          ? UserInformationVisibility.CRYPTO_INFO_ONLY
          : mocks.informationVisibility,
        addressId: selectedAddress.id,
      }
    }),
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
    times(user.length * 2).map(() => ({
      userId: faker.helpers.arrayElement(user).id,
    })),
    data =>
      prismaClient.userSession.createMany({
        data,
      }),
  )
  const userSession = await prismaClient.userSession.findMany()
  logEntity({ userSession })

  /*
  userEmailAddress
  */
  await batchAsyncAndLog(
    times(user.length / 2).map(() => ({
      ...mockCreateUserEmailAddressInput(),
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
  const usersUnusedOnCryptoAddress = [...user]
  const emailAddressesToRelateToEmbeddedWallets = userEmailAddress.filter(
    x => x.source === UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH,
  )
  await batchAsyncAndLog(
    times(user.length / 2).map(() => {
      // a crypto user address must only ever be associated with one user so we use splice here to ensure we can randomly assign these models to users without any duplicates
      const selectedUser = usersUnusedOnCryptoAddress.splice(
        faker.number.int({ min: 0, max: usersUnusedOnCryptoAddress.length - 1 }),
        1,
      )[0]
      // we want all known ENS addresses to not have a full name so we always display their ENS
      // in the testing environment. This lets us verify our onchain integrations are working easily
      const shouldUseInitialCryptoAddress =
        initialCryptoAddresses.length &&
        selectedUser.informationVisibility === UserInformationVisibility.CRYPTO_INFO_ONLY
      return {
        ...mockCreateUserCryptoAddressInput(),
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
          : parseThirdwebAddress(faker.finance.ethereumAddress()),
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
  void batchAsyncAndLog(userCryptoAddress, addresses =>
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
  const userActionTypes = ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN
  const userActionTypesToPersist = times(seedSizes([400, 4000, 40000])).map(index => {
    return userActionTypes[index % userActionTypes.length]
  })

  /*
  NFTMint
  */
  await batchAsyncAndLog(
    userActionTypesToPersist
      .filter(x => x === UserActionType.NFT_MINT)
      .map(() => {
        return mockCreateNFTMintInput()
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
        if (actionType === UserActionType.DONATION && topDonorsLeftToAssign.length) {
          return topDonorsLeftToAssign.pop()!
        }
        if (seedSize !== SeedSize.SM && index < 10) {
          return localUserCryptoAddress
        }
        if (index % 4 === 1) {
          return faker.helpers.arrayElement(userSession)
        }
        return faker.helpers.arrayElement(userCryptoAddress)
      }
      const relatedItem = getRelatedItem()

      return {
        ...mockCreateUserActionInput(),
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
        userId: relatedItem.userId,
        // a nft mint must only ever be associated with one action so we use splice here to ensure we can randomly assign these models to users without any duplicates
        nftMintId:
          actionType === UserActionType.NFT_MINT
            ? usedNftMints.splice(faker.number.int({ min: 0, max: usedNftMints.length - 1 }), 1)[0]
                .id
            : null,
        campaignName:
          actionType === UserActionType.POLL
            ? faker.helpers.arrayElement(Object.values(UserActionPollCampaignName))
            : USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[actionType],
      }
    }),
    data =>
      prismaClient.userAction.createMany({
        data,
      }),
  )
  const userAction = await prismaClient.userAction.findMany({
    include: { nftMint: true },
  })
  logEntity({ userAction })

  const userActionsWithNftMint = userAction.filter(
    action =>
      action.actionType === UserActionType.NFT_MINT &&
      action.nftMintId &&
      action.nftMint?.costAtMint.isPositive(),
  )
  await batchAsyncAndLog(userActionsWithNftMint, async function (data) {
    const updatePromises = data.map(userActionNftMint => {
      if (userActionNftMint.nftMint?.costAtMintUsd.isPositive()) {
        return prismaClient.user.update({
          where: { id: userActionNftMint.userId },
          data: {
            totalDonationAmountUsd: {
              increment: userActionNftMint.nftMint.costAtMintUsd,
            },
          },
        })
      }
    })
    await Promise.all(updatePromises)
  })
  logger.info("updated users' total donation USD amount based on NFT mint cost")

  const userActionsByType = groupBy(userAction, x => x.actionType) as Record<
    UserActionType,
    typeof userAction
  >

  /*
  userActionEmail
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.EMAIL].map(action => ({
      ...mockCreateUserActionEmailInput(),
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
    flatten(
      userActionsByType[UserActionType.EMAIL].map(actionEmail =>
        // LATER-TASK expand this to be more than 1 recipient once we have UX
        times(faker.helpers.arrayElement([1])).map(() => ({
          ...mockCreateUserActionEmailRecipientInput(),
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
      ...mockCreateUserActionCallInput(),
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
  userActionTweetAtPerson
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.TWEET_AT_PERSON].map(action => ({
      ...mockUserActionTweetAtPersonInput(),
      id: action.id,
    })),
    data =>
      prismaClient.userActionTweetAtPerson.createMany({
        data,
      }),
  )
  const userActionTweetAtPerson = await prismaClient.userActionTweetAtPerson.findMany()
  logEntity({ userActionTweetAtPerson })

  /*
  userActionDonation
  */
  const topDonorUserIdMap = keyBy(topDonorCryptoAddresses, x => x.userId)
  await batchAsyncAndLog(
    userActionsByType[UserActionType.DONATION].map(action => {
      const initialMockValues = mockCreateUserActionDonationInput()
      const isTopDonor = topDonorUserIdMap[action.userId]
      const amount = isTopDonor
        ? faker.number.float({ min: 100000, max: 200000, multipleOf: 0.01 })
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
  const userActionDonation = await prismaClient.userActionDonation.findMany({
    include: { userAction: true },
  })
  logEntity({ userActionDonation })

  await batchAsyncAndLog(userActionDonation, async function (data) {
    const updatePromises = data.map(donation => {
      if (donation.amountUsd.isPositive()) {
        return prismaClient.user.update({
          where: { id: donation.userAction.userId },
          data: {
            totalDonationAmountUsd: {
              increment: donation.amountUsd,
            },
          },
        })
      }
    })
    await Promise.all(updatePromises)
  })
  logger.info("updated users' total donation USD amount based on donation amount")

  /*
  userActionOptIn
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.OPT_IN].map(action => {
      return {
        ...mockCreateUserActionOptInInput(),
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

  /*
  userActionVoterRegistration
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.VOTER_REGISTRATION].map(action => {
      return {
        ...mockCreateUserActionVoterRegistrationInput(),
        id: action.id,
      }
    }),
    data =>
      prismaClient.userActionVoterRegistration.createMany({
        data,
      }),
  )
  const userActionVoterRegistration = await prismaClient.userActionVoterRegistration.findMany()
  logEntity({ userActionVoterRegistration })

  /*
  userActionRsvpEvent
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.RSVP_EVENT].map(action => {
      return {
        ...mockCreateUserActionRsvpEventInput(),
        id: action.id,
      }
    }),
    data =>
      prismaClient.userActionRsvpEvent.createMany({
        data,
      }),
  )
  const userActionRsvpEvents = await prismaClient.userActionRsvpEvent.findMany()
  logEntity({ userActionRsvpEvents })

  /*
  userActionVoterAttestation
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.VOTER_ATTESTATION].map(action => {
      return {
        ...mockCreateUserActionVoterAttestationInput(),
        id: action.id,
      }
    }),
    data =>
      prismaClient.userActionVoterAttestation.createMany({
        data,
      }),
  )
  const userActionVoterAttestation = await prismaClient.userActionVoterAttestation.findMany()
  logEntity({ userActionVoterAttestation })

  /*
  userActionViewKeyRaces
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.VIEW_KEY_RACES].map(action => {
      return {
        ...mockCreateUserActionViewKeyRacesInput(),
        id: action.id,
      }
    }),
    data =>
      prismaClient.userActionViewKeyRaces.createMany({
        data,
      }),
  )
  const userActionViewKeyRaces = await prismaClient.userActionViewKeyRaces.findMany()
  logEntity({ userActionViewKeyRaces })

  /*
  userActionVotingInformationResearched
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.VOTING_INFORMATION_RESEARCHED].map(action => {
      return {
        ...mockCreateUserActionVotingInformationResearchedInput(),
        id: action.id,
      }
    }),
    data =>
      prismaClient.userActionVotingInformationResearched.createMany({
        data,
      }),
  )
  const userActionVotingInformationResearched =
    await prismaClient.userActionVotingInformationResearched.findMany()
  logEntity({ userActionVotingInformationResearched })

  /*
  userActionVotingDay
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.VOTING_DAY].map(action => {
      return {
        ...mockCreateUserActionVotingDayInput(),
        id: action.id,
      }
    }),
    data =>
      prismaClient.userActionVotingDay.createMany({
        data,
      }),
  )
  const userActionVotingDay = await prismaClient.userActionVotingDay.findMany()
  logEntity({ userActionVotingDay })

  /*
  userActionPoll
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.POLL].map(action => {
      return {
        ...mockCreateUserActionPollInput(),
        id: action.id,
      }
    }),
    data =>
      prismaClient.userActionPoll.createMany({
        data,
      }),
  )
  const userActionPoll = await prismaClient.userActionPoll.findMany()
  logEntity({ userActionPoll })

  /* userActionRefer */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.REFER].map(action => {
      return {
        ...mockCreateUserActionReferInput(),
        id: action.id,
      }
    }),
    data =>
      prismaClient.userActionRefer.createMany({
        data,
      }),
  )
  const userActionRefer = await prismaClient.userActionRefer.findMany()
  logEntity({ userActionRefer })

  /*
  userActionPollAnswer
  */
  await batchAsyncAndLog(
    userActionsByType[UserActionType.POLL].map(action => {
      return {
        ...mockCreateUserActionPollAnswerInput(action.campaignName as UserActionPollCampaignName),
        id: action.id,
        userActionPollId: faker.helpers.arrayElement(userActionPoll).id,
      }
    }),
    data =>
      prismaClient.userActionPollAnswer.createMany({
        data,
      }),
  )
  const userActionPollAnswer = await prismaClient.userActionPollAnswer.findMany()
  logEntity({ userActionPollAnswer })
}

void runBin(seed)
