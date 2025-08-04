export interface TimelinePlotPoint {
  date: Date | string | null
  description: string
  id: number | string
  isHighlighted?: boolean
  isMajorMilestone?: boolean
  success: boolean
  title: string
}

export interface Milestone extends TimelinePlotPoint {
  date: Date | null
  positionPercent: number
}
