import { UserActionType } from '@prisma/client'

const ACTIVE_CLIENT_USER_ACTION_TYPES = [
  UserActionType.CALL,
  UserActionType.EMAIL,
  UserActionType.DONATION,
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.NFT_MINT,
  UserActionType.VOTER_REGISTRATION,
  UserActionType.VOTER_ATTESTATION,
  UserActionType.VOTING_INFORMATION_RESEARCHED,
  UserActionType.VOTING_DAY,
] as const
export type ActiveClientUserActionType = (typeof ACTIVE_CLIENT_USER_ACTION_TYPES)[number]
