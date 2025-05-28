import { UserActionType } from '@prisma/client'

const _CA_ACTIVE_CLIENT_USER_ACTION_TYPES = [
  UserActionType.OPT_IN,
  UserActionType.TWEET,
  UserActionType.LINKEDIN,
  UserActionType.VIEW_KEY_PAGE,
] as const
export type CAActiveClientUserActionType = (typeof _CA_ACTIVE_CLIENT_USER_ACTION_TYPES)[number]
