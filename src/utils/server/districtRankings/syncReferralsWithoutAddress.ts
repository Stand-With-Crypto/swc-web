'use server'
import 'server-only'

import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('syncReferralsWithoutAddress')

const getReferralsWithoutAddress = async () => {
  const referActionsWithoutAddress = await prismaClient.userAction.findMany({
    where: {
      actionType: UserActionType.REFER,
      userActionRefer: {
        addressId: null,
      },
    },
    include: {
      userActionRefer: true,
      user: {
        include: {
          address: true,
        },
      },
    },
  })
  return referActionsWithoutAddress
}

/**
 * Identifies UserActionRefer records without address and updates them when
 * their associated user has an address.
 *
 * This helps ensure that referral actions created when users didn't have addresses
 * are properly attributed once the users add addresses.
 */
export async function syncReferralsWithoutAddress() {
  const referActionsWithoutAddress = await getReferralsWithoutAddress()

  if (!referActionsWithoutAddress?.length) {
    return {
      message: 'No REFER actions without address found',
      processedCount: 0,
      updatedCount: 0,
    }
  }

  const actionsToUpdate = referActionsWithoutAddress.filter(
    action => action.user.address !== null && action.user.address.id,
  )

  if (!actionsToUpdate.length) {
    logger.info('No REFER actions to update')
    return {
      message: 'No REFER actions to update',
      processedCount: referActionsWithoutAddress.length,
      updatedCount: 0,
    }
  }

  logger.info(`Found ${actionsToUpdate.length} REFER actions where user now has an address`)

  try {
    const updatedActions = await Promise.all(
      actionsToUpdate.map(action =>
        prismaClient.userActionRefer.update({
          where: { id: action.userActionRefer!.id },
          data: { addressId: action.user.address!.id },
        }),
      ),
    )

    return {
      message: 'Successfully synced referrals without address',
      processedCount: actionsToUpdate.length,
      updatedCount: updatedActions.length,
    }
  } catch (error) {
    logger.error('Error syncing referrals without address:', error)
    Sentry.captureException(error, {
      tags: { domain: 'referrals' },
      extra: {
        actions: referActionsWithoutAddress.map(action => ({
          id: action.id,
        })),
      },
    })

    return {
      message: 'Error syncing referrals without address',
      processedCount: 0,
      updatedCount: 0,
    }
  }
}
