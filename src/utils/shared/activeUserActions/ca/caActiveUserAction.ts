import { UserActionType } from '@prisma/client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CA_ACTIVE_CLIENT_USER_ACTION_TYPES = [UserActionType.OPT_IN, UserActionType.TWEET] as const
export type CAActiveClientUserActionType = (typeof CA_ACTIVE_CLIENT_USER_ACTION_TYPES)[number]
