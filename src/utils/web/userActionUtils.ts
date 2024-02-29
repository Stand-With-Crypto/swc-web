import { UserActionType } from '@prisma/client'

import { ActiveClientUserActionType } from '@/utils/shared/activeUserAction'

export const USER_ACTION_TYPE_PRIORITY_ORDER: ReadonlyArray<ActiveClientUserActionType> = [
  UserActionType.OPT_IN,
  UserActionType.VOTER_REGISTRATION,
  UserActionType.CALL,
  UserActionType.EMAIL,
  UserActionType.DONATION,
  UserActionType.TWEET,
  UserActionType.NFT_MINT,
]
