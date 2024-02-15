import {
  DonationOrganization,
  User,
  UserActionType,
  UserInformationVisibility,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { CoinbaseCommercePayment } from '@/utils/server/coinbaseCommerce/paymentRequest'
import { prismaClient } from '@/utils/server/prismaClient'
import { generateReferralId } from '@/utils/shared/referralId'
import { UserActionDonationCampaignName } from '@/utils/shared/userActionCampaigns'

/**
 * NOTE: All the fields reference below will be found in the `metadata` field.
 * NOTE: The email field is only provided (and technically used) if the user accesses the default Coinbase Commerce payment URL.
 *   This is because the default Coinbase Commerce payment URL will force the user to enter an email address before proceeding to payment options.
 *   (Later on, we are most likely going to take in email address when supporting Retail Dapps' SwC mini-dapp.)
 * NOTE: we cannot use `payment.event.data.payments.payer_addresses` to check for wallet existence because
 *   if the user uses their Coinbase account to donate, then the payment address will be set to one of Coinbase's hot wallets, which is incorrect to record.
 *
 * (1) If we have a user ID, then the user definitely (should) exist, and we can store the payment request under the user. Done!
 * - If we do NOT have a user ID, then we move to case (2).
 *
 * (2) If we have a session ID, then we perform the following:
 * - If there is a user attached to the session ID, then we easily store the payment request under the user. Done!
 * - If there is NO user attached to the session ID, then we move to case (3).
 *
 * (3) If we do not have a session ID at all OR if there is NO user attached to the session ID, then we perform the following:
 * - We log this event to Sentry if there is no session ID at all because we need to understand how/why this situation happened and its cadence.
 * - If the response has an email address in the metadata:
 *   - If we can find a user whose primary email address matches the response's email address and is verified, then we easily store the payment request under the user. Done!
 *   - If not, then we attempt to find the first user who has this email address as a secondary email address and is verified. If that is found, then we store. Done!
 *   - If we cannot find anyone based on email address, then we move to case (4).
 *
 * (4) If we are unable to find any user even with session ID or email address, then we perform the following:
 * - We log this event to Sentry because we need to understand how/why this situation happened and its cadence.
 * - We create a new user from scratch, create the email address record, and update/create the appropriate session.
 *
 * @param payment
 * @returns Promise<void>
 */
export async function storePaymentRequest(payment: CoinbaseCommercePayment) {
  // Using user ID (if available).
  if (payment.event.data.metadata.userId) {
    const user = await prismaClient.user.findFirst({
      where: {
        id: payment.event.data.metadata.userId,
      },
    })
    if (user) {
      return createUserActionDonation(user, payment)
    }

    // Log if the Commerce payment contained a user ID but we have no corresponding user.
    Sentry.captureMessage('no user found for user ID provided in Coinbase Commerce payment', {
      extra: {
        paymentId: payment.id,
        pricing: payment.event.data.pricing,
        userId: payment.event.data.metadata.userId,
      },
    })
  }

  // Using session ID (if available).
  if (payment.event.data.metadata.sessionId) {
    const userSession = await prismaClient.userSession.findFirst({
      include: {
        user: true,
      },
      where: {
        id: payment.event.data.metadata.sessionId,
      },
    })

    // If we have a user for the given session, then we can store.
    if (userSession?.user) {
      return createUserActionDonation(userSession.user, payment)
    }
  } else {
    // Log if we have no session ID.
    Sentry.captureMessage('no session ID provided in Coinbase Commerce payment', {
      extra: { paymentId: payment.id, pricing: payment.event.data.pricing },
    })
  }

  // Falling back to email address (if available).
  if (payment.event.data.metadata.email) {
    let userEmailAddress = await prismaClient.userEmailAddress.findFirst({
      include: {
        user: true,
      },
      where: {
        emailAddress: payment.event.data.metadata.email,
        asPrimaryUserEmailAddress: {
          NOT: null || undefined,
        },
        isVerified: true,
      },
    })

    // If we found a user based on primary email address, then we can store.
    if (userEmailAddress?.user) {
      Sentry.captureMessage('creating user action donation based on primary email address', {
        extra: {
          paymentId: payment.id,
          pricing: payment.event.data.pricing,
          userId: userEmailAddress.user.id,
        },
      })
      return await createUserActionDonation(userEmailAddress.user, payment)
    }

    // Falling back to secondary email address instead of primary.
    userEmailAddress = await prismaClient.userEmailAddress.findFirst({
      include: {
        user: true,
      },
      where: {
        emailAddress: payment.event.data.metadata.email,
        isVerified: true,
      },
    })
    if (userEmailAddress?.user) {
      Sentry.captureMessage('creating user action donation based on secondary email address', {
        extra: {
          paymentId: payment.id,
          pricing: payment.event.data.pricing,
          userId: userEmailAddress.user.id,
        },
      })
      return await createUserActionDonation(userEmailAddress.user, payment)
    }
  }

  // If we have not returned at this point, then we were unable to find a user based on session ID or email address.
  // We should create the user based on whatever information we have.
  const newUser = await createNewUser(payment)
  return createUserActionDonation(newUser, payment)
}

/**
 * Creates new user based on the payment request and the user session.
 *
 * @param payment
 * @param userSession
 * @returns newly created user
 */
async function createNewUser(payment: CoinbaseCommercePayment) {
  Sentry.captureMessage('no user found for session ID or user ID - creating new user', {
    extra: {
      paymentId: payment.id,
      pricing: payment.event.data.pricing,
    },
  })

  // Create new user and also new email if available.
  const newUser = await prismaClient.user.create({
    include: {
      primaryUserEmailAddress: true,
    },
    data: {
      referralId: generateReferralId(),
      hasOptedInToEmails: false,
      hasOptedInToSms: false,
      hasOptedInToMembership: false,
      informationVisibility: UserInformationVisibility.ANONYMOUS,
      acquisitionReferer: '',
      acquisitionSource: 'coinbase-commerce-webhook',
      acquisitionMedium: '',
      acquisitionCampaign: '',
      ...(payment.event.data.metadata.email
        ? {
            userEmailAddresses: {
              create: {
                isVerified: false,
                emailAddress: payment.event.data.metadata.email,
                source: 'USER_ENTERED',
              },
            },
          }
        : {}),
    },
  })
  // If there is a user session, then we should update the user ID.
  // Otherwise, if that metadata is provided, then we should create a new session.
  const userSession = await prismaClient.userSession.findFirst({
    include: {
      user: true,
    },
    where: {
      id: payment.event.data.metadata.sessionId,
    },
  })
  if (userSession) {
    Sentry.captureMessage('updating existing session to new user', {
      extra: {
        paymentId: payment.id,
        pricing: payment.event.data.pricing,
        userSession,
      },
    })
    await prismaClient.userSession.update({
      where: { id: userSession.id },
      data: { userId: newUser.id },
    })
  } else if (payment.event.data.metadata.sessionId) {
    Sentry.captureMessage('creating new session for new user', {
      extra: {
        paymentId: payment.id,
        pricing: payment.event.data.pricing,
        userSession,
      },
    })
    await prismaClient.userSession.create({
      data: { userId: newUser.id, id: payment.event.data.metadata.sessionId },
    })
  }
  return newUser
}

/**
 * Helper function to create user action donation in database.
 * @param user
 * @param payment
 */
async function createUserActionDonation(user: User, payment: CoinbaseCommercePayment) {
  return prismaClient.userAction.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      campaignName: UserActionDonationCampaignName.DEFAULT,
      actionType: UserActionType.DONATION,
      userActionDonation: {
        create: {
          amount: payment.event.data.pricing.local.amount, // NOTE: `local` is based on the Coinbase Commerce settings. This should be set to USD.
          amountCurrencyCode: payment.event.data.pricing.local.currency,
          amountUsd: payment.event.data.pricing.local.amount,
          recipient: DonationOrganization.STAND_WITH_CRYPTO,
          coinbaseCommerceDonationId: payment.id,
        },
      },
    },
  })
}
