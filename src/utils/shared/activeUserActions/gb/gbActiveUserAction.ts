import { UserActionType } from '@prisma/client'

const _GB_ACTIVE_CLIENT_USER_ACTION_TYPES = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.LINKEDIN,
  UserActionType.VIEW_KEY_PAGE,
] as const
export type GBActiveClientUserActionType = (typeof _GB_ACTIVE_CLIENT_USER_ACTION_TYPES)[number]
