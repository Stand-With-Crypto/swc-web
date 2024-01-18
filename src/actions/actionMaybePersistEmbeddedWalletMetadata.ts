'use server'
import { appRouterGetAuthUser } from '@/utils/server/thirdweb/appRouterGetAuthUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { UserEmailAddressSource } from '@prisma/client'
import { differenceInMinutes } from 'date-fns'
import * as Sentry from '@sentry/nextjs'
import 'server-only'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email().toLowerCase(),
})

const logger = getLogger('actionMaybePersistEmbeddedWalletMetadata')

export async function actionMaybePersistEmbeddedWalletMetadata(data: z.infer<typeof schema>) {
  const authUser = await appRouterGetAuthUser()
  if (!authUser) {
    throw new Error('Unauthenticated')
  }
  const validatedFields = schema.safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  const existingEmail = await prismaClient.userEmailAddress.findFirst({
    select: { id: true },
    where: {
      emailAddress: validatedFields.data.email,
      user: {
        userCryptoAddresses: { some: { cryptoAddress: authUser.address } },
      },
    },
  })

  if (existingEmail) {
    logger.info('embedded wallet email already exists')
    return existingEmail
  }
  logger.info('creating new email for user based off embedded wallet')
  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      userCryptoAddresses: { some: { cryptoAddress: authUser.address } },
    },
    include: { userCryptoAddresses: true },
  })
  /*
  This endpoint could be used to maliciously associate email addresses with users who are not actually authenticated with them
  So we'll need to to treat this email address as unverified until the user actually verifies it
  As a small mitigation, we'll only allow this endpoint to be called if the wallet address was recently created
  */
  if (user.userCryptoAddresses.every(x => differenceInMinutes(new Date(), x.datetimeCreated) > 1)) {
    Sentry.captureMessage('Suspicious embedded wallet email creation attempt', {
      extra: { user, email: validatedFields.data.email },
    })
    return null
  }

  return prismaClient.userEmailAddress.create({
    select: { id: true },
    data: {
      emailAddress: validatedFields.data.email,
      userId: user.id,
      isVerified: false,
      source: UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH,
    },
  })
}
