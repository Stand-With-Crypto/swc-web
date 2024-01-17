'use server'
import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { zodUpdateUserProfileFormAction } from '@/validation/forms/zodUpdateUserProfile'
import { UserEmailAddressSource } from '@prisma/client'
import 'server-only'
import { z } from 'zod'

export async function actionUpdateUserProfile(
  data: z.infer<typeof zodUpdateUserProfileFormAction>,
) {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    throw new Error('Unauthenticated')
  }
  const validatedFields = zodUpdateUserProfileFormAction.safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      userCryptoAddresses: { some: { cryptoAddress: authUser.address } },
    },
    include: {
      userEmailAddresses: true,
    },
  })
  const existingUserEmailAddress = validatedFields.data.email
    ? user.userEmailAddresses.find(
        ({ emailAddress }) => emailAddress === validatedFields.data.email,
      )
    : null
  const primaryUserEmailAddress =
    validatedFields.data.email && !existingUserEmailAddress
      ? await prismaClient.userEmailAddress.create({
          data: {
            emailAddress: validatedFields.data.email,
            source: UserEmailAddressSource.USER_ENTERED,
            isVerified: false,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        })
      : existingUserEmailAddress
  const address = validatedFields.data.address
    ? await prismaClient.address.upsert({
        where: {
          googlePlaceId: validatedFields.data.address.googlePlaceId,
        },
        create: {
          ...validatedFields.data.address,
        },
        update: {},
      })
    : null
  const localUser = parseLocalUserFromCookies()
  const peopleAnalytics = getServerPeopleAnalytics({ address: authUser.address, localUser })
  peopleAnalytics.set({
    ...(validatedFields.data.address
      ? convertAddressToAnalyticsProperties(validatedFields.data.address)
      : {}),
    // https://docs.mixpanel.com/docs/data-structure/user-profiles#reserved-user-properties
    $email: validatedFields.data.email,
    $phone: validatedFields.data.phoneNumber,
    $name: validatedFields.data.fullName,
  })

  const updatedUser = await prismaClient.user.update({
    where: {
      id: user.id,
    },
    data: {
      fullName: validatedFields.data.fullName,
      phoneNumber: validatedFields.data.phoneNumber,
      isPubliclyVisible: validatedFields.data.isPubliclyVisible,
      addressId: address?.id || null,
      primaryUserEmailAddressId: primaryUserEmailAddress?.id || null,
    },
  })

  return {
    user: updatedUser,
  }
}
