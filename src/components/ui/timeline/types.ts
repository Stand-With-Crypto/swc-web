import { TimelinePlotPointStatus } from '@/components/ui/timeline/constants'

export interface TimelinePlotPoint {
  date: Date | string | null
  description: string
  id: number | string
  isHighlighted?: boolean
  isMajorMilestone?: boolean
  status: TimelinePlotPointStatus
  title: string
}

export interface Milestone extends TimelinePlotPoint {
  date: Date | null
  positionPercent: number
}
