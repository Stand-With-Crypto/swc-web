import { UserActionType } from '@prisma/client'

const _AU_ACTIVE_CLIENT_USER_ACTION_TYPES = [UserActionType.OPT_IN, UserActionType.TWEET] as const
export type AUActiveClientUserActionType = (typeof _AU_ACTIVE_CLIENT_USER_ACTION_TYPES)[number]
