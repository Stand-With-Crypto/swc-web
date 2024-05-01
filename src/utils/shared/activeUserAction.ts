import { UserActionType } from '@prisma/client'

export const ACTIVE_CLIENT_USER_ACTION_TYPES = [
  UserActionType.CALL,
  UserActionType.EMAIL,
  UserActionType.DONATION,
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.NFT_MINT,
  UserActionType.VOTER_REGISTRATION,
] as const
export type ActiveClientUserActionType = (typeof ACTIVE_CLIENT_USER_ACTION_TYPES)[number]
