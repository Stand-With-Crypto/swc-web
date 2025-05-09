import type { SMSStatus } from '@prisma/client'

export function userHasOptedInToSMS(user?: { smsStatus?: SMSStatus; phoneNumber?: string } | null) {
  if (!user) {
    return false
  }

  return user.smsStatus !== 'NOT_OPTED_IN' && user.smsStatus !== 'OPTED_OUT' && !!user.phoneNumber
}
