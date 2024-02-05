import 'server-only'
import _ from 'lodash'

import { getMaybeUserAndMethodOfMatch } from '@/utils/server/getMaybeUserAndMethodOfMatch'
import { UserActionType } from '@prisma/client'

export async function getSignedUserActionByType(actionType: UserActionType) {
  const { user } = await getMaybeUserAndMethodOfMatch({
    include: {
      userActions: {
        where: { actionType },
      },
    },
    take: 1,
  })

  return user?.userActions[0]
}
