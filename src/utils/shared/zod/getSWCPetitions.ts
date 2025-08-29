import { array, boolean, date, number, object, string, z } from 'zod'

export const zodPetitionMilestoneSchema = object({
  title: string().min(1),
  datetimeCompleted: date(),
})

export const zodPetitionSchemaValidation = object({
  data: object({
    slug: string().min(1),
    title: string().min(1),
    countryCode: string().length(2),
    content: string().min(1),
    countSignaturesGoal: number().positive(),
    enableAutomaticMilestones: boolean().optional(),
    image: string().url().nullable().optional(),
    milestones: array(zodPetitionMilestoneSchema).optional(),
    datetimeFinished: string().nullable().optional(),
  }),
})

export type PetitionMilestone = z.infer<typeof zodPetitionMilestoneSchema>
export type SWCPetitionFromBuilderIO = z.infer<typeof zodPetitionSchemaValidation>['data']

export type SWCPetition = SWCPetitionFromBuilderIO & {
  signaturesCount: number
}
