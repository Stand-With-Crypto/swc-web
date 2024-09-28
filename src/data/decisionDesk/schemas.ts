import { z } from 'zod'

export const GetRacesParamsSchema = z.object({
  /**
   * Maximum is 250
   */
  limit: z.number().max(250).optional(),
  /**
   * Page number
   */
  page: z.number().optional(),
  /**
   * Year
   */
  year: z.number().optional(),
  /**
   * Race Date
   */
  race_date: z.string().optional(),
  /**
   * State Name
   */
  state_name: z.string().optional(),
  /**
   * Two-letter abbreviation of the state
   */
  state: z.string().length(2).optional(),
  /**
   * FIPS code for a given state
   */
  state_fips: z.string().optional(),
  /**
   * Party as in PARTIES inside src/data/decisionDesk/constants.ts
   */
  party: z.string().optional(),
  /**
   * Party ID as in PARTIES inside src/data/decisionDesk/constants.ts
   */
  party_id: z.number().optional(),
  /**
   * Type
   */
  type: z.string().optional(),
  /**
   * Race Name
   */
  name: z.string().optional(),
  /**
   * Election Type ID as in ELECTION_TYPES inside src/data/decisionDesk/constants.ts
   */
  election_type_id: z.number().optional(),
  /**
   * Office ID as in OFFICES inside src/data/decisionDesk/constants.ts
   */
  office_id: z.number().optional(),
  /**
   * Office as in OFFICES inside src/data/decisionDesk/constants.ts
   */
  office: z.string().optional(),
  /**
   * District
   */
  district: z.string().optional(),
  /**
   * Comma-separated race IDs
   */
  race_id: z.string().optional(),
})

export type GetRacesParams = z.infer<typeof GetRacesParamsSchema>
