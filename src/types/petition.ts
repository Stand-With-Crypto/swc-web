export interface PetitionMilestone {
  title: string
  datetimeCompleted: Date
}

export interface PetitionData {
  slug: string
  title: string
  countryCode: string
  description: string
  content: string
  countSignaturesGoal: number
  signaturesCount: number
  enableAutomaticMilestones: boolean
  image?: string | null
  milestones?: PetitionMilestone[]
  datetimeFinished?: Date | null
}
