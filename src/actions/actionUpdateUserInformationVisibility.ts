'use server'
import 'server-only'

import { after } from 'next/server'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import { zodUpdateUserInformationVisibility } from '@/validation/forms/zodUpdateUserInformationVisibility'

export const actionUpdateUserInformationVisibility = withServerActionMiddleware(
  'actionUpdateUserInformationVisibility',
  _actionUpdateUserInformationVisibility,
)

async function _actionUpdateUserInformationVisibility(
  data: z.infer<typeof zodUpdateUserInformationVisibility>,
) {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    throw new Error('Unauthenticated')
  }
  const validatedFields = zodUpdateUserInformationVisibility.safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  await throwIfRateLimited({ context: 'authenticated' })
  const { informationVisibility } = validatedFields.data
  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
  })
  after(
    getServerPeopleAnalytics({
      userId: authUser.userId,
      localUser: await parseLocalUserFromCookies(),
    }).set({
      'Information Visibility': informationVisibility,
    }).flush,
  )

  const updatedUser = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      informationVisibility,
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
