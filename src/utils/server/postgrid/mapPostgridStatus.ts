import { UserActionLetterStatus } from '@prisma/client'

/**
 * Maps PostGrid letter status values to our UserActionLetterStatus enum
 * PostGrid statuses: ready, printing, processed_for_delivery, completed, cancelled
 */
export const POSTGRID_STATUS_TO_LETTER_STATUS: Record<string, UserActionLetterStatus> = {
  ready: UserActionLetterStatus.READY,
  printing: UserActionLetterStatus.PRINTING,
  processed_for_delivery: UserActionLetterStatus.PROCESSED_FOR_DELIVERY,
  completed: UserActionLetterStatus.COMPLETED,
  cancelled: UserActionLetterStatus.CANCELLED,
  canceled: UserActionLetterStatus.CANCELLED, // Handle both spellings
}

export function mapPostgridStatus(postgridStatus: string): UserActionLetterStatus {
  const normalized = postgridStatus.toLowerCase().trim()
  return POSTGRID_STATUS_TO_LETTER_STATUS[normalized] || UserActionLetterStatus.UNKNOWN
}

