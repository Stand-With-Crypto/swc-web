import { array, boolean, date, number, object, string, z } from 'zod'

export const zodPetitionMilestoneSchema = object({
  title: string().nonempty(),
  datetimeCompleted: date(),
})

export const zodPetitionSchemaValidation = object({
  data: object({
    slug: string().nonempty(),
    title: string().nonempty(),
    countryCode: string().length(2),
    content: string().nonempty(),
    countSignaturesGoal: number().positive(),
    enableAutomaticMilestones: boolean().optional(),
    image: string().url().nullish(),
    milestones: array(zodPetitionMilestoneSchema).optional(),
    datetimeFinished: string().nullish(),
  }),
})

export type PetitionMilestone = z.infer<typeof zodPetitionMilestoneSchema>
export type SWCPetitionFromBuilderIO = z.infer<typeof zodPetitionSchemaValidation>['data']

export type SWCPetition = SWCPetitionFromBuilderIO & {
  signaturesCount: number
}
