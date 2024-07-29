import { UserActionOptInType } from '@prisma/client'
import { object, string, z } from 'zod'

import {
  ExternalUserActionOptInResult,
  handleExternalUserActionOptIn,
} from '@/utils/server/externalOptIn/handleExternalUserActionOptIn'
import {
  VerifiedSWCPartner,
  VerifiedSWCPartnerApiResponse,
} from '@/utils/server/verifiedSWCPartner/constants'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'

export const zodVerifiedSWCPartnersUserAddress = object({
  streetNumber: string(),
  route: string(),
  subpremise: string(),
  locality: string(),
  administrativeAreaLevel1: string(),
  administrativeAreaLevel2: string(),
  postalCode: string(),
  postalCodeSuffix: string(),
  countryCode: string().length(2),
})

export const zodVerifiedSWCPartnersUserActionOptIn = z.object({
  emailAddress: zodEmailAddress,
  optInType: z.nativeEnum(UserActionOptInType),
  campaignName: z.string(),
  isVerifiedEmailAddress: z.boolean(),
  firstName: zodFirstName.optional(),
  lastName: zodLastName.optional(),
  address: zodVerifiedSWCPartnersUserAddress.optional(),
  phoneNumber: zodPhoneNumber.optional().transform(str => str && normalizePhoneNumber(str)),
  hasOptedInToReceiveSMSFromSWC: z.boolean().optional(),
  hasOptedInToEmails: z.boolean().optional(),
  hasOptedInToMembership: z.boolean().optional(),
})

type Input = z.infer<typeof zodVerifiedSWCPartnersUserActionOptIn> & {
  partner: VerifiedSWCPartner
}

export async function verifiedSWCPartnersUserActionOptIn(
  input: Input,
): Promise<VerifiedSWCPartnerApiResponse<ExternalUserActionOptInResult>> {
  return await handleExternalUserActionOptIn({
    emailAddress: input.emailAddress,
    optInType: input.optInType,
    campaignName: input.campaignName,
    isVerifiedEmailAddress: input.isVerifiedEmailAddress,
    firstName: input.firstName,
    lastName: input.lastName,
    address: input.address,
    phoneNumber: input.phoneNumber,
    hasOptedInToReceiveSMSFromSWC: input.hasOptedInToReceiveSMSFromSWC,
    hasOptedInToEmails: input.hasOptedInToEmails,
    hasOptedInToMembership: input.hasOptedInToMembership,
    partner: input.partner,
  })
}
