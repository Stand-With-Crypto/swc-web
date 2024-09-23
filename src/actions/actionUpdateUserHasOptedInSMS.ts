'use server'
import 'server-only'

import { Address, User, UserCryptoAddress } from '@prisma/client'
import { z } from 'zod'

import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME } from '@/inngest/functions/capitolCanary/upsertAdvocateInCapitolCanary'
import { inngest } from '@/inngest/inngest'
import { appRouterGetAuthUser } from '@/utils/server/authentication/appRouterGetAuthUser'
import {
  CapitolCanaryCampaignName,
  getCapitolCanaryCampaignID,
} from '@/utils/server/capitolCanary/campaigns'
import { prismaClient } from '@/utils/server/prismaClient'
import { throwIfRateLimited } from '@/utils/server/ratelimit/throwIfRateLimited'
import { withServerActionMiddleware } from '@/utils/server/serverWrappers/withServerActionMiddleware'
import * as smsActions from '@/utils/server/sms/actions'
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

  const updatedUser = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      phoneNumber,
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })

  if (phoneNumber) {
    updatedUser.smsStatus = await smsActions.optInUser(phoneNumber, user)
  }

  await handleCapitolCanarySMSUpdate(updatedUser)

  return {
    user: getClientUser(updatedUser),
  }
}

async function handleCapitolCanarySMSUpdate(
  updatedUser: User & { address: Address | null } & {
    primaryUserCryptoAddress: UserCryptoAddress | null
  },
) {
  await inngest.send({
    name: CAPITOL_CANARY_UPSERT_ADVOCATE_INNGEST_EVENT_NAME,
    data: {
      campaignId: getCapitolCanaryCampaignID(CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER),
      user: updatedUser,
      opts: {
        isSmsOptin: true,
        // shouldSendSmsOptinConfirmation: true,
      },
    },
  })
}
