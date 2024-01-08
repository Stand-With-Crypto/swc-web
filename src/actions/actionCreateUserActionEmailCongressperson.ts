'use server'
import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { getUserSessionIdOnAppRouter } from '@/utils/server/serverUserSessionId'
import { getLogger } from '@/utils/shared/logger'
import { zodUserActionFormEmailCongresspersonAction } from '@/validation/zodUserActionFormEmailCongressperson'
import { UserActionType, UserEmailAddressSource } from '@prisma/client'
import 'server-only'
import { z } from 'zod'

const logger = getLogger(`actionCreateUserActionEmailCongressperson`)

export async function actionCreateUserActionEmailCongressperson(
  data: z.infer<typeof zodUserActionFormEmailCongresspersonAction>,
) {
  logger.info('triggered')
  const userMatch = await getMaybeUserAndMethodOfMatch({ include: { userCryptoAddress: true } })
  logger.info(userMatch.user ? 'found user' : 'no user found')
  const sessionId = getUserSessionIdOnAppRouter()
  const validatedFields = zodUserActionFormEmailCongresspersonAction.safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  logger.info('validated fields')
  let user =
    userMatch.user ||
    (await prismaClient.user.create({
      data: {
        isPubliclyVisible: false,
        userSessions: { create: { id: sessionId } },
      },
      include: { userCryptoAddress: true },
    }))
  logger.info('fetched/created user')
  const userAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: user.id } },
      actionType: UserActionType.EMAIL,
      ...('userCryptoAddress' in userMatch
        ? {
            userCryptoAddress: { connect: { id: userMatch.userCryptoAddress.id } },
          }
        : { userSession: { connect: { id: sessionId } } }),
      userActionEmail: {
        create: {
          senderEmail: validatedFields.data.email,
          fullName: validatedFields.data.fullName,
          phoneNumber: validatedFields.data.phoneNumber,
          address: {
            connectOrCreate: {
              where: { googlePlaceId: validatedFields.data.address.googlePlaceId },
              create: validatedFields.data.address,
            },
          },
          userActionEmailRecipients: {
            createMany: {
              data: [
                {
                  dtsiSlug: validatedFields.data.dtsiSlug,
                },
              ],
            },
          },
        },
      },
    },
    include: {
      userActionEmail: true,
    },
  })
  logger.info('created action')
  /*
  We assume any updates the user makes to this action should propagate to the user's profile
  */
  user = await prismaClient.user.update({
    where: { id: user.id },
    include: { userCryptoAddress: true },
    data: {
      fullName: validatedFields.data.fullName,
      phoneNumber: validatedFields.data.phoneNumber,
      address: {
        connect: {
          id: userAction.userActionEmail!.addressId,
        },
      },
      primaryUserEmailAddress: {
        connectOrCreate: {
          where: {
            address_userId: {
              address: validatedFields.data.email,
              userId: user.id,
            },
          },
          create: {
            address: validatedFields.data.email,
            source: UserEmailAddressSource.USER_ENTERED_UNVERIFIED,
            userId: user.id,
          },
        },
      },
    },
  })
  // TODO actually trigger the logic to send the email to capital canary. We should be calling some Inngest function here

  logger.info('updated user')
  return { user, userAction }
}
