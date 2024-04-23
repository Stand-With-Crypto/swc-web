'use server'
import 'server-only'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'

export const actionUpdateUserHasOptedInToMembership = withServerActionMiddleware(
  'actionUpdateUserHasOptedInToMembership',
  _actionUpdateUserHasOptedInToMembership,
)

export async function _actionUpdateUserHasOptedInToMembership() {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    throw new Error('Unauthenticated')
  }
  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
  })
  await getServerPeopleAnalytics({
    userId: authUser.userId,
    localUser: parseLocalUserFromCookies(),
  }).set({
    'Has Opted In To Membership': true,
  })

  await throwIfRateLimited({ context: 'authenticated' })
  const updatedUser = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      hasOptedInToMembership: true,
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })

  return {
    user: getClientUser(updatedUser),
  }
}
