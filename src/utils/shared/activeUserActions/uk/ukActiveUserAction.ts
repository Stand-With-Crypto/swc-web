import { UserActionType } from '@prisma/client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UK_ACTIVE_CLIENT_USER_ACTION_TYPES = [UserActionType.TWEET] as const
export type UKActiveClientUserActionType = (typeof UK_ACTIVE_CLIENT_USER_ACTION_TYPES)[number]
