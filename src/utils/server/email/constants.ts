export enum EmailEventName {
  PROCESSED = 'processed',
  DEFERRED = 'deferred',
  DELIVERED = 'delivered',
  OPEN = 'open',
  CLICK = 'click',
  BOUNCE = 'bounce',
  DROPPED = 'dropped',
  SPAM_REPORT = 'spamreport',
  UNSUBSCRIBE = 'unsubscribe',
  GROUP_UNSUBSCRIBE = 'group_unsubscribe',
  GROUP_RESUBSCRIBE = 'group_resubscribe',
}

export type EmailEvent = {
  email: string
  timestamp: number
  event: EmailEventName
  sg_message_id: string
  sg_event_id: string
  useragent?: string
  url?: string
  variant?: string
  category?: string
} & { [key: string]: string }

export const EVENT_NAME_TO_HUMAN_READABLE_STRING: Record<EmailEventName, string> = {
  [EmailEventName.PROCESSED]: 'Processed',
  [EmailEventName.DEFERRED]: 'Deferred',
  [EmailEventName.DELIVERED]: 'Delivered',
  [EmailEventName.OPEN]: 'Open',
  [EmailEventName.CLICK]: 'Click',
  [EmailEventName.BOUNCE]: 'Bounce',
  [EmailEventName.DROPPED]: 'Dropped',
  [EmailEventName.SPAM_REPORT]: 'Spam Report',
  [EmailEventName.UNSUBSCRIBE]: 'Unsubscribe',
  [EmailEventName.GROUP_UNSUBSCRIBE]: 'Group Unsubscribe',
  [EmailEventName.GROUP_RESUBSCRIBE]: 'Group Resubscribe',
}
