import { UserActionType } from '@prisma/client'

export type ActiveClientUserActionType = UserActionType
export const ACTIVE_CLIENT_USER_ACTION_TYPES = Object.values(UserActionType)
