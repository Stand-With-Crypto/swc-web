import { UserActionType } from '@prisma/client'

export const ACTIVE_CLIENT_USER_ACTION_TYPES = [
  UserActionType.CALL,
  UserActionType.EMAIL,
  UserActionType.DONATION,
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.NFT_MINT,
  UserActionType.VOTER_REGISTRATION,
  UserActionType.VOTER_ATTESTATION,
  UserActionType.TWEET_AT_PERSON, // TODO: remove
] as const
export type ActiveClientUserActionType = (typeof ACTIVE_CLIENT_USER_ACTION_TYPES)[number]
