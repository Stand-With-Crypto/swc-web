'use server'
import 'server-only'

import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'
import { zodUpdateUserHasOptedInToSMS } from '@/validation/forms/zodUpdateUserHasOptedInToSMS'

export const actionUpdateUserHasOptedInToSMS = withServerActionMiddleware(
  'actionUpdateUserHasOptedInToSMS',
  _actionUpdateUserHasOptedInToSMS,
)

export type UpdateUserHasOptedInToSMSPayload = z.infer<typeof zodUpdateUserHasOptedInToSMS>

async function _actionUpdateUserHasOptedInToSMS(data: UpdateUserHasOptedInToSMSPayload) {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    throw new Error('Unauthenticated')
  }
  const validatedFields = zodUpdateUserHasOptedInToSMS.safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  await throwIfRateLimited({ context: 'authenticated' })
  const { phoneNumber } = validatedFields.data
  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
  })

  await getServerPeopleAnalytics({
    userId: authUser.userId,
    localUser: parseLocalUserFromCookies(),
  }).set({
    'Has Opted In to SMS': true,
  })

  const updatedUser = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      phoneNumber,
      hasOptedInToSms: !!phoneNumber,
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
