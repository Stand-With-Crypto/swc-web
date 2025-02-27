'use server'
import 'server-only'

import { UserActionType } from '@prisma/client'

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
      referActionsWithoutAddress: 0,
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
      referActionsWithoutAddress: referActionsWithoutAddress.length,
      updatedCount: 0,
    }
  }

  logger.info(`Found ${actionsToUpdate.length} REFER actions where user now has an address`)

  const updatedActions = await Promise.all(
    actionsToUpdate.map(action => {
      if (!action.userActionRefer || !action.user.address) {
        logger.warn(`Missing userActionRefer or address for action ${action.id}`)
        return Promise.resolve(null)
      }

      return prismaClient.userActionRefer.update({
        where: { id: action.userActionRefer.id },
        data: { addressId: action.user.address.id },
      })
    }),
  )

  return {
    message: 'Successfully synced referrals without address',
    referActionsWithoutAddress: referActionsWithoutAddress.length,
    updatedCount: updatedActions.filter(Boolean).length,
  }
}
