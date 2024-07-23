'use server'
import 'server-only'

import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { optInUser } from '@/utils/server/sms/actions'
import { withServerActionMiddleware } from '@/utils/server/withServerActionMiddleware'

export const actionWelcomeSMSAfterPhoneSignUp = withServerActionMiddleware(
  'actionWelcomeSMSAfterPhoneSignUp',
  _actionWelcomeSMSAfterPhoneSignUp,
)

async function _actionWelcomeSMSAfterPhoneSignUp() {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    throw new Error('Unauthenticated')
  }

  await throwIfRateLimited({ context: 'authenticated' })

  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
  })

  if (user.hasOptedInToSms && user.phoneNumber) {
    await optInUser(user.phoneNumber, user)
  }
}
