import { SegmentedMessage } from 'sms-segments-calculator'

export const countSegments = (message: string) => new SegmentedMessage(message).segmentsCount
