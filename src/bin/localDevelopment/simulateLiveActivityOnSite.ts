import { faker } from '@faker-js/faker'
import { Prisma, UserActionType } from '@prisma/client'
import { omit } from 'lodash-es'

import { runBin } from '@/bin/runBin'
import { mockCreateAddressInput } from '@/mocks/models/mockAddress'
import { mockCreateNFTMintInput } from '@/mocks/models/mockNFTMint'
import { mockCreateUserInput } from '@/mocks/models/mockUser'
import { mockCreateUserActionInput } from '@/mocks/models/mockUserAction'
import { mockCreateUserActionCallInput } from '@/mocks/models/mockUserActionCall'
import { mockCreateUserActionDonationInput } from '@/mocks/models/mockUserActionDonation'
import { mockCreateUserActionEmailInput } from '@/mocks/models/mockUserActionEmail'
import { mockCreateUserActionEmailRecipientInput } from '@/mocks/models/mockUserActionEmailRecipient'
import { mockCreateUserActionOptInInput } from '@/mocks/models/mockUserActionOptIn'
import { mockUserActionTweetAtPerson } from '@/mocks/models/mockUserActionTweetAtPerson'
import { mockCreateUserActionVoterRegistrationInput } from '@/mocks/models/mockUserActionVoterRegistration'
import { mockCreateUserCryptoAddressInput } from '@/mocks/models/mockUserCryptoAddress'
import { mockCreateUserEmailAddressInput } from '@/mocks/models/mockUserEmailAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { sleep } from '@/utils/shared/sleep'

const logger = getLogger('simulateLiveActivityOnSite')

async function simulateLiveActivityOnSite() {
  logger.info(
    'simulating live activity on the website.\n NOTE: this will run until you exit the process.',
  )
  // eslint-disable-next-line no-constant-condition
  while (true) {
    logger.info('creating user and action')
    const user = await createUser()
    await createAction(user)
    logger.info('waiting 3 seconds')
    await sleep(3000)
  }
}
void runBin(simulateLiveActivityOnSite)

async function createUser() {
  const user = await prismaClient.user.create({
    data: {
      ...mockCreateUserInput(),
      address: {
        create: mockCreateAddressInput(),
      },
    },
  })
  const authType = faker.helpers.arrayElement([
    'session' as const,
    'email' as const,
    'cryptoAddress' as const,
  ])
  switch (authType) {
    case 'session': {
      const res = await prismaClient.userSession.create({
        data: { userId: user.id },
        include: {
          user: {
            include: {
              userSessions: true,
              primaryUserCryptoAddress: true,
              primaryUserEmailAddress: true,
            },
          },
        },
      })
      return res.user
    }
    case 'email': {
      const res = await prismaClient.userEmailAddress.create({
        data: { ...mockCreateUserEmailAddressInput(), userId: user.id },
        include: {
          user: {
            include: {
              userSessions: true,
              primaryUserCryptoAddress: true,
              primaryUserEmailAddress: true,
            },
          },
        },
      })
      await prismaClient.user.update({
        where: { id: user.id },
        data: { primaryUserEmailAddressId: res.id },
      })
      res.user.primaryUserEmailAddressId = res.id
      return res.user
    }
    case 'cryptoAddress': {
      const res = await prismaClient.userCryptoAddress.create({
        data: { ...mockCreateUserCryptoAddressInput(), userId: user.id },
        include: {
          user: {
            include: {
              userSessions: true,
              primaryUserCryptoAddress: true,
              primaryUserEmailAddress: true,
            },
          },
        },
      })
      await prismaClient.user.update({
        where: { id: user.id },
        data: { primaryUserCryptoAddressId: res.id },
      })
      res.user.primaryUserCryptoAddressId = res.id
      return res.user
    }
  }
}

async function createAction(user: Awaited<ReturnType<typeof createUser>>) {
  const actionType = user.primaryUserEmailAddressId
    ? UserActionType.EMAIL
    : faker.helpers.arrayElement(Object.values(UserActionType))
  const mockAction: Prisma.UserActionCreateInput = {
    ...mockCreateUserActionInput(),
    actionType,
    user: { connect: { id: user.id } },
    userSession: user.userSessions[0]?.id
      ? { connect: { id: user.userSessions[0]?.id } }
      : undefined,
    userCryptoAddress: user.primaryUserCryptoAddressId
      ? { connect: { id: user.primaryUserCryptoAddressId } }
      : undefined,
    userEmailAddress: user.primaryUserEmailAddressId
      ? { connect: { id: user.primaryUserEmailAddressId } }
      : undefined,
  }
  switch (actionType) {
    case UserActionType.CALL:
      return prismaClient.userAction.create({
        data: {
          ...mockAction,
          userActionCall: {
            create: {
              ...mockCreateUserActionCallInput(),
              address: { create: mockCreateAddressInput() },
            },
          },
        },
      })
    case UserActionType.TWEET:
      return prismaClient.userAction.create({
        data: {
          ...mockAction,
        },
      })
    case UserActionType.EMAIL:
      return prismaClient.userAction.create({
        data: {
          ...mockAction,
          userActionEmail: {
            create: {
              ...mockCreateUserActionEmailInput(),
              address: { create: mockCreateAddressInput() },
              userActionEmailRecipients: {
                create: {
                  ...omit(mockCreateUserActionEmailRecipientInput(), 'userActionEmailId'),
                },
              },
            },
          },
        },
      })
    case UserActionType.DONATION:
      return prismaClient.userAction.create({
        data: {
          ...mockAction,
          userActionDonation: {
            create: {
              ...mockCreateUserActionDonationInput(),
            },
          },
        },
      })
    case UserActionType.OPT_IN:
      return prismaClient.userAction.create({
        data: {
          ...mockAction,
          userActionOptIn: {
            create: {
              ...mockCreateUserActionOptInInput(),
            },
          },
        },
      })
    case UserActionType.NFT_MINT:
      return prismaClient.userAction.create({
        data: {
          ...mockAction,
          nftMint: {
            create: {
              ...mockCreateNFTMintInput(),
            },
          },
        },
      })
    case UserActionType.VOTER_REGISTRATION:
      return prismaClient.userAction.create({
        data: {
          ...mockAction,
          userActionVoterRegistration: {
            create: {
              ...mockCreateUserActionVoterRegistrationInput(),
            },
          },
        },
      })
    case UserActionType.TWEET_AT_PERSON:
      return prismaClient.userAction.create({
        data: {
          ...mockAction,
          userActionTweetAtPerson: {
            create: {
              recipientDtsiSlug: mockUserActionTweetAtPerson().recipientDtsiSlug,
            },
          },
        },
      })
  }
}
