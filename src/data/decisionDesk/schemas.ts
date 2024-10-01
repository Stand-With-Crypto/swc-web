import { z } from 'zod'

export const GetRacesParamsSchema = z.object({
  /**
   * Maximum is 250
   */
  limit: z.string().pipe(z.coerce.number().int().max(250)).pipe(z.coerce.string()).optional(),
  page: z.string().pipe(z.coerce.number().int().gte(1).lte(50)).pipe(z.coerce.string()).optional(),
  /**
   * Year minimum is 2016.
   */
  year: z.string().pipe(z.coerce.number().int().min(2016)).pipe(z.coerce.string()).optional(),
  race_date: z.string().optional(),
  state_name: z.string().optional(),
  state: z.string().length(2).optional(),
  state_fips: z.string().optional(),
  /**
   * Party as in PARTIES inside src/data/decisionDesk/constants.ts
   */
  party: z.string().optional(),
  /**
   * Party ID as in PARTIES inside src/data/decisionDesk/constants.ts
   */
  party_id: z.string().pipe(z.coerce.number()).pipe(z.coerce.string()).optional(),
  type: z.string().optional(),
  name: z.string().optional(),
  /**
   * Election Type ID as in ELECTION_TYPES inside src/data/decisionDesk/constants.ts
   */
  election_type_id: z.string().pipe(z.coerce.number()).pipe(z.coerce.string()).optional(),
  /**
   * Office ID as in OFFICES inside src/data/decisionDesk/constants.ts
   */
  office_id: z.string().pipe(z.coerce.number()).pipe(z.coerce.string()).optional(),
  /**
   * Office as in OFFICES inside src/data/decisionDesk/constants.ts
   */
  office: z.string().optional(),
  district: z.string().optional(),
  race_id: z.string().pipe(z.coerce.number()).pipe(z.coerce.string()).optional(),
})

export type GetRacesParams = z.infer<typeof GetRacesParamsSchema>
