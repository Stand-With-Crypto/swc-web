'use server'
import { appRouterGetAuthUser } from '@/utils/server/appRouterGetAuthUser'
import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { prismaClient } from '@/utils/server/prismaClient'
import { zodUserActionFormEmailCongresspersonAction } from '@/validation/zodUserActionFormEmailCongressperson'
import { UserEmailAddressSource } from '@prisma/client'
import 'server-only'
import { z } from 'zod'

export async function actionCreateUserActionEmailCongressperson(
  data: z.infer<typeof zodUserActionFormEmailCongresspersonAction>,
) {
  const userMatch = await getMaybeUserAndMethodOfMatch({})
  const validatedFields = zodUserActionFormEmailCongresspersonAction.safeParse(data)
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  return {}
}
