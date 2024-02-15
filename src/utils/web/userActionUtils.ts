import { UserActionType } from '@prisma/client'

export const USER_ACTION_TYPE_PRIORITY_ORDER: ReadonlyArray<UserActionType> = [
  UserActionType.OPT_IN,
  UserActionType.VOTER_REGISTRATION,
  UserActionType.CALL,
  UserActionType.EMAIL,
  UserActionType.DONATION,
  UserActionType.TWEET,
  UserActionType.NFT_MINT,
]
