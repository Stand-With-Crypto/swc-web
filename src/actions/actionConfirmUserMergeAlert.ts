'use server'
import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { mergeUsers } from '@/utils/server/mergeUsers'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { zodUpdateUserProfileFormAction } from '@/validation/forms/zodUpdateUserProfile'
import { UserEmailAddressSource } from '@prisma/client'
import 'server-only'
import { z } from 'zod'

const schema = z.object({
  userMergeAlertId: z.string(),
  userToDeleteId: z.string(),
})

const logger = getLogger(`actionConfirmUserMergeAlert`)

export async function actionConfirmUserMergeAlert(
  data: z.infer<typeof zodUpdateUserProfileFormAction>,
) {
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
  const { userMergeAlertId, userToDeleteId } = validatedFields.data
  const user = await prismaClient.user.findFirstOrThrow({
    where: {
      userCryptoAddresses: {
        some: {
          address: authUser.address,
        },
      },
    },
  })
  let userMergeAlert = await prismaClient.userMergeAlert.findFirstOrThrow({
    where: { id: userMergeAlertId },
  })

  const otherUserToMergeList = [userMergeAlert.userAId, userMergeAlert.userBId].filter(
    id => id !== user.id,
  )
  if (otherUserToMergeList.length !== 1) {
    throw new Error('Unexpected number of matching users')
  }
  if ([userMergeAlert.userAId, userMergeAlert.userBId].every(id => id !== userToDeleteId)) {
    throw new Error('userToDeleteId not in merge alert')
  }
  const fieldToUpdate =
    userMergeAlert.userAId === user.id
      ? ('hasBeenConfirmedByUserA' as const)
      : ('hasBeenConfirmedByUserB' as const)

  if (userMergeAlert[fieldToUpdate]) {
    throw new Error('User already confirmed merge')
  }
  const otherFieldToUpdate =
    userMergeAlert.userAId === user.id
      ? ('hasBeenConfirmedByUserB' as const)
      : ('hasBeenConfirmedByUserA' as const)

  if (userToDeleteId === user.id && !userMergeAlert[otherFieldToUpdate]) {
    throw new Error(
      'must confirm merge on the account that will be deleted first so the final confirmation occurs on the account that wont be deleted',
    )
  }

  userMergeAlert = await prismaClient.userMergeAlert.update({
    where: { id: userMergeAlertId },
    data: {
      [fieldToUpdate]: true,
    },
  })
  if (!userMergeAlert.hasBeenConfirmedByUserA || !userMergeAlert.hasBeenConfirmedByUserB) {
    logger.info('current user confirmed merge alert, waiting for other user to confirm')
    return { status: 'pending' as const }
  }
  logger.info('Both users have confirmed merge, starting merge process')
  // as we add additional foreign keys to users, we'll want to make sure we account for them in this merge logic
  await mergeUsers({
    userToKeepId: user.id,
    userToDeleteId,
    persist: true,
  })

  return { status: 'complete' as const }
}
