import { UserActionType } from '@prisma/client'

const _GB_ACTIVE_CLIENT_USER_ACTION_TYPES = [UserActionType.OPT_IN, UserActionType.TWEET] as const
export type GBActiveClientUserActionType = (typeof _GB_ACTIVE_CLIENT_USER_ACTION_TYPES)[number]
