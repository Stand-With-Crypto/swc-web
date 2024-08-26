import { string, z } from 'zod'

import {
  ExternalUserActionViewKeyRacesResult,
  handleExternalUserActionViewKeyRaces,
} from '@/utils/server/externalOptIn/handleExternalUserActionViewKeyRaces'
import {
  VerifiedSWCPartner,
  VerifiedSWCPartnerApiResponse,
} from '@/utils/server/verifiedSWCPartner/constants'

export const zodVerifiedSWCPartnersUserActionViewKeyRaces = z.object({
  userId: string(),
  sessionId: string(),
  usCongressionalDistrict: string(),
  usaState: string(),
  campaignName: string().optional(),
})

type Input = z.infer<typeof zodVerifiedSWCPartnersUserActionViewKeyRaces> & {
  partner: VerifiedSWCPartner
}

export async function verifiedSWCPartnersUserActionViewKeyRaces(
  input: Input,
): Promise<VerifiedSWCPartnerApiResponse<ExternalUserActionViewKeyRacesResult>> {
  return await handleExternalUserActionViewKeyRaces({
    userId: input.userId,
    sessionId: input.sessionId,
    usCongressionalDistrict: input.usCongressionalDistrict,
    usaState: input.usaState,
    campaignName: input.campaignName,
  })
}
