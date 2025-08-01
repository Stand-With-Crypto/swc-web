export interface TimelinePlotPoint {
  date: Date | string | null
  description: string
  isHighlighted?: boolean
  isMajorMilestone?: boolean
  success: boolean
  title: string
}

export interface Milestone extends TimelinePlotPoint {
  date: Date | null
  id: number
  positionPercent: number
}
