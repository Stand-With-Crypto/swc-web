import { UserActionType } from '@prisma/client'

const _CA_ACTIVE_CLIENT_USER_ACTION_TYPES = [UserActionType.OPT_IN, UserActionType.TWEET] as const
export type CAActiveClientUserActionType = (typeof _CA_ACTIVE_CLIENT_USER_ACTION_TYPES)[number]
