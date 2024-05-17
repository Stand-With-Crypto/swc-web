import { UserActionType } from '@prisma/client'

import { ActiveClientUserActionType } from '@/utils/shared/activeUserAction'

export const USER_ACTION_TYPE_CTA_PRIORITY_ORDER: ReadonlyArray<ActiveClientUserActionType> = [
  UserActionType.EMAIL,
  UserActionType.OPT_IN,
  UserActionType.VOTER_REGISTRATION,
  UserActionType.CALL,
  UserActionType.DONATION,
  UserActionType.TWEET,
  UserActionType.NFT_MINT,
]
