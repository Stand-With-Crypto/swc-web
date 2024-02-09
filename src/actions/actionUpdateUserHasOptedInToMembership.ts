'use server'
import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import 'server-only'

export async function actionUpdateUserHasOptedInToMembership() {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    throw new Error('Unauthenticated')
  }
  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
  })
  const localUser = parseLocalUserFromCookies()
  const peopleAnalytics = getServerPeopleAnalytics({ localUser, userId: authUser.userId })
  peopleAnalytics.set({
    'Has Opted In To Membership': true,
  })

  const updatedUser = await prismaClient.user.update({
    data: {
      hasOptedInToMembership: true,
    },
    include: {
      primaryUserCryptoAddress: true,
    },
    where: {
      id: user.id,
    },
  })

  return {
    user: getClientUser(updatedUser),
  }
}
