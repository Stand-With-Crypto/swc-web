import {
  Address,
  Prisma,
  SMSStatus,
  User,
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
  } else {
    const hostedUrl = (await createInAppCharge(zodResult.data)).data.hosted_url
    const user = await prismaClient.user.findFirst({
      include: {
        userEmailAddresses: true,
        userSessions: true,
      },
      where: {
        userEmailAddresses: {
          some: { emailAddress: zodResult.data.email },
        },
      },
    })

    await maybeUpsertUser({ existingUser: user, input: zodResult.data })

    return new NextResponse(JSON.stringify({ charge_url: hostedUrl }), { status: 200 })
  }
}

async function maybeUpsertUser({
  existingUser,
  input,
}: {
  existingUser: UserWithRelations | null
  input: CoinbaseCommerceDonation
}): Promise<{ user: UserWithRelations; userState: AnalyticsUserActionUserState }> {
  const { email, full_name } = input

  const nameParts = full_name.split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1, nameParts.length).join(' ')

  if (existingUser) {
    const updatePayload: Prisma.UserUpdateInput = {
      ...(firstName && !existingUser.firstName && { firstName: firstName }),
      ...(lastName && !existingUser.lastName && { lastName: lastName }),
      ...(email &&
        existingUser.userEmailAddresses.every(addr => addr.emailAddress !== email) && {
          userEmailAddresses: {
            create: {
              emailAddress: email,
              isVerified: false,
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
      smsStatus: SMSStatus.NOT_OPTED_IN,
      userEmailAddresses: {
        create: {
          emailAddress: email,
          isVerified: false,
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
