import { UserActionLetterStatus } from '@prisma/client'

export enum PostgridStatusName {
  READY = 'ready',
  PRINTING = 'printing',
  PROCESSED_FOR_DELIVERY = 'processed_for_delivery',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const POSTGRID_STATUS_TO_LETTER_STATUS: Record<PostgridStatusName, UserActionLetterStatus> =
  {
    [PostgridStatusName.READY]: UserActionLetterStatus.READY,
    [PostgridStatusName.PRINTING]: UserActionLetterStatus.PRINTING,
    [PostgridStatusName.PROCESSED_FOR_DELIVERY]: UserActionLetterStatus.PROCESSED_FOR_DELIVERY,
    [PostgridStatusName.COMPLETED]: UserActionLetterStatus.COMPLETED,
    [PostgridStatusName.CANCELLED]: UserActionLetterStatus.CANCELLED,
  }
