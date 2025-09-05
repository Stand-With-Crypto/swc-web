import { UserActionType } from '@prisma/client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const US_ACTIVE_CLIENT_USER_ACTION_TYPES = [
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
  UserActionType.REFER,
  UserActionType.POLL,
  UserActionType.CLAIM_NFT,
] as const
export type USActiveClientUserActionType = (typeof US_ACTIVE_CLIENT_USER_ACTION_TYPES)[number]
