import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLogger } from '@/utils/shared/logger'
import { Prisma } from '@prisma/client'
import { GetFindResult } from '@prisma/client/runtime/library'

const logger = getLogger(`maybeUpsertUser`)

type FindArgs = Pick<Prisma.UserFindFirstArgs, 'include' | 'select'>
export type MaybeUpsertUserResult = 'New' | 'Existing' | 'Existing With Updates'
type MaybeUpsertUserReturn<I extends FindArgs> = {
  user: GetFindResult<Prisma.$UserPayload, I>
  upsertUserResult: MaybeUpsertUserResult
}
type MaybeUpsertUserArgs<I extends FindArgs> = {
  userArgs:
    | { createFields: Prisma.UserCreateInput }
    | {
        user: GetFindResult<Prisma.$UserPayload, I>
        updateFields: Prisma.UserUpdateInput
      }
  selectArgs: Prisma.SelectSubset<I, Prisma.UserFindFirstArgs>
}

export async function maybeUpsertUser<I extends FindArgs>({
  userArgs,
  selectArgs,
}: MaybeUpsertUserArgs<I>): Promise<MaybeUpsertUserReturn<I>> {
  if ('user' in userArgs) {
    const { user, updateFields } = userArgs
    const keysToUpdate = Object.keys(updateFields)
    if (keysToUpdate) {
      const updatedUser = (await prismaClient.user.update({
        where: { id: user.id },
        data: updateFields,
        ...selectArgs,
      })) as GetFindResult<Prisma.$UserPayload, I>
      logger.info(`existing user found, updated the following fields: ${keysToUpdate.join(', ')}`)
      return { user: updatedUser, upsertUserResult: 'Existing With Updates' }
    }
    logger.info(`existing user found`)
    return { user, upsertUserResult: 'Existing' }
  }
  const user = (await prismaClient.user.create({
    data: userArgs.createFields,
    ...selectArgs,
  })) as GetFindResult<Prisma.$UserPayload, I>
  logger.info(`new user created`)
  return { user, upsertUserResult: 'New' }
}
