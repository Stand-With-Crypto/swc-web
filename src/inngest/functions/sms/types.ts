import { Prisma } from '@prisma/client'

export interface GetPhoneNumberOptions {
  includePendingDoubleOptIn?: boolean
  cursor?: Date
  userWhereInput?: Prisma.UserGroupByArgs['where']
  campaignName?: string
}

export interface BulkSMSPayload {
  messages: Array<{
    smsBody: string
    userWhereInput?: GetPhoneNumberOptions['userWhereInput']
    includePendingDoubleOptIn?: boolean
    campaignName: string
    media?: string[]
  }>
  // default to ET: -4
  timezone?: number
  send?: boolean
  // Number of milliseconds or Time string compatible with the ms package, e.g. "30m", "3 hours", or "2.5d"
  sleepTime?: string | number
  // This is used to take into account the current queue size when queuing new messages
  currentSegmentsInQueue?: number
}
