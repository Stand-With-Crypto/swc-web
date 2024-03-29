import {
  Address,
  Prisma,
  User,
  UserActionOptInType,
  UserActionType,
  UserEmailAddress,
  UserEmailAddressSource,
  UserInformationVisibility,
  UserSession,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'

import {
  CoinbaseCommerceDonation,
  createInAppCharge,
  CreateInAppChargeParams,
  zodCoinbaseCommerceDonation,
} from '@/utils/server/coinbaseCommerce/createCharge'
import { prismaClient } from '@/utils/server/prismaClient'
import { AnalyticsUserActionUserState } from '@/utils/server/serverAnalytics'
import { VerifiedSWCPartner } from '@/utils/server/verifiedSWCPartner/constants'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'

type UserWithRelations = User & {
  userEmailAddresses: UserEmailAddress[]
  userSessions: Array<UserSession>
  address?: Address | null
}

const logger = getLogger('inAppDonation')

export async function POST(request: NextRequest) {
  const rawRequestBody = await request.json()

  const body = rawRequestBody as CoinbaseCommerceDonation
  const zodResult = zodCoinbaseCommerceDonation.safeParse(body)
  if (!zodResult.success) {
    // Only capture message, but still attempt to proceed with the request.
    Sentry.captureMessage('unexpected Coinbase Commerce donation request format', {
      extra: {
        body,
        errors: zodResult.error.flatten(),
      },
    })
  }
  const params: CreateInAppChargeParams = {
    address: body.address,
    email: body.email,
    employer: body.employer,
    full_name: body.full_name,
    is_citizen: body.is_citizen,
    occupation: body.occupation,
  }
  const hostedUrl = (await createInAppCharge(params)).data.hosted_url

  const actionType = UserActionType.DONATION
  const existingAction = await prismaClient.userAction.findFirst({
    include: {
      user: {
        include: {
          userEmailAddresses: true,
          userSessions: true,
        },
      },
    },
    where: {
      actionType,
      userActionOptIn: {
        optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
      },
      user: {
        userEmailAddresses: {
          some: { emailAddress: body.email },
        },
      },
    },
  })

  await maybeUpsertUser({ existingUser: existingAction?.user, input: params })

  return new NextResponse(JSON.stringify({ charge_url: hostedUrl }), { status: 200 })
}

async function maybeUpsertUser({
  existingUser,
  input,
}: {
  existingUser: UserWithRelations | undefined
  input: CreateInAppChargeParams
}): Promise<{ user: UserWithRelations; userState: AnalyticsUserActionUserState }> {
  const { email, full_name } = input

  const nameParts = full_name.split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1, nameParts.length).join(' ')

  if (existingUser) {
    const updatePayload: Prisma.UserUpdateInput = {
      // TODO typesafe against invalid fields
      ...(firstName && !existingUser.firstName && { firstName: firstName }),
      ...(lastName && !existingUser.lastName && { lastName: lastName }),
      ...(email &&
        existingUser.userEmailAddresses.every(addr => addr.emailAddress !== email) && {
          userEmailAddresses: {
            create: {
              emailAddress: email,
              isVerified: true,
              source: UserEmailAddressSource.VERIFIED_THIRD_PARTY,
            },
          },
        }),
    }
    const keysToUpdate = Object.keys(updatePayload)
    if (!keysToUpdate.length) {
      return { user: existingUser, userState: 'Existing' }
    }
    logger.info(`updating the following user fields ${keysToUpdate.join(', ')}`)
    const user = await prismaClient.user.update({
      where: { id: existingUser.id },
      data: updatePayload,
      include: {
        userEmailAddresses: true,
        userSessions: true,
        address: true,
      },
    })
    const existingEmail = user.userEmailAddresses.find(e => e.emailAddress === email)
    if (existingEmail && !existingEmail.isVerified) {
      logger.info(`verifying previously unverified email`)
      await prismaClient.userEmailAddress.update({
        where: { id: existingEmail.id },
        data: { isVerified: true },
      })
    }

    if (!user.primaryUserEmailAddressId && email) {
      const newEmail = user.userEmailAddresses.find(addr => addr.emailAddress === email)!
      logger.info(`updating primary email`)
      await prismaClient.user.update({
        where: { id: user.id },
        data: { primaryUserEmailAddressId: newEmail.id },
      })
      user.primaryUserEmailAddressId = newEmail.id
    }
    return { user, userState: 'Existing With Updates' }
  }
  let user = await prismaClient.user.create({
    include: {
      userEmailAddresses: true,
      userSessions: true,
    },
    data: {
      acquisitionReferer: '',
      acquisitionSource: VerifiedSWCPartner.COINBASE,
      acquisitionMedium: 'verified-swc-partner-api',
      acquisitionCampaign: '',
      referralId: generateReferralId(),
      userSessions: {
        create: {},
      },
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: '',
      hasOptedInToEmails: true,
      hasOptedInToMembership: false,
      hasOptedInToSms: false,
      userEmailAddresses: {
        create: {
          emailAddress: email,
          isVerified: true,
          source: UserEmailAddressSource.VERIFIED_THIRD_PARTY,
        },
      },
    },
  })
  user = await prismaClient.user.update({
    include: {
      userEmailAddresses: true,
      userSessions: true,
      address: true,
    },
    where: { id: user.id },
    data: {
      primaryUserEmailAddressId: user.userEmailAddresses[0].id,
    },
  })
  return { user, userState: 'New' }
}
