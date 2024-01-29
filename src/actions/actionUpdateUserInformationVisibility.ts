'use server'
import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { zodUpdateUserInformationVisibility } from '@/validation/forms/zodUpdateUserInformationVisibility'
import 'server-only'
import { z } from 'zod'

export async function actionUpdateUserInformationVisibility(
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
  const { informationVisibility } = validatedFields.data
  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      id: authUser.userId,
    },
  })
  const localUser = parseLocalUserFromCookies()
  const peopleAnalytics = getServerPeopleAnalytics({ userId: authUser.userId, localUser })
  peopleAnalytics.set({
    'Information Visibility': informationVisibility,
  })

  const updatedUser = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      informationVisibility,
    },
    include: {
      primaryUserCryptoAddress: true,
    },
  })

  return {
    user: getClientUser(updatedUser),
  }
}
