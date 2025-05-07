import { UserActionType } from '@prisma/client'

const _AU_ACTIVE_CLIENT_USER_ACTION_TYPES = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.LINKEDIN,
  UserActionType.VIEW_KEY_PAGE,
] as const
export type AUActiveClientUserActionType = (typeof _AU_ACTIVE_CLIENT_USER_ACTION_TYPES)[number]
