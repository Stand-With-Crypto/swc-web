import { UserActionOptInType } from '@prisma/client'
import { object, string, z } from 'zod'

import { handleExternalUserActionOptIn } from '@/utils/server/externalOptIn/handleExternalUserActionOptIn'
import { ExternalUserActionOptInResult } from '@/utils/server/externalOptIn/types'
import {
  VerifiedSWCPartner,
  VerifiedSWCPartnerApiResponse,
} from '@/utils/server/verifiedSWCPartner/constants'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodOptionalEmptyPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

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

export const getZodVerifiedSWCPartnersUserActionOptInSchema = (
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
) =>
  z.object({
    emailAddress: zodEmailAddress,
    optInType: z.nativeEnum(UserActionOptInType),
    campaignName: z.string(),
    isVerifiedEmailAddress: z.boolean(),
    firstName: zodFirstName.optional(),
    lastName: zodLastName.optional(),
    address: zodVerifiedSWCPartnersUserAddress.optional(),
    phoneNumber: zodOptionalEmptyPhoneNumber(countryCode),
    hasOptedInToReceiveSMSFromSWC: z.boolean().optional(),
    hasOptedInToEmails: z.boolean().optional(),
    hasOptedInToMembership: z.boolean().optional(),
    countryCode: zodSupportedCountryCode,
  })

type Input = z.infer<ReturnType<typeof getZodVerifiedSWCPartnersUserActionOptInSchema>> & {
  partner: VerifiedSWCPartner
  hasValidPhoneNumber: boolean
}

export async function verifiedSWCPartnersUserActionOptIn(
  input: Input,
): Promise<VerifiedSWCPartnerApiResponse<ExternalUserActionOptInResult>> {
  return handleExternalUserActionOptIn({
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
    countryCode: input.countryCode,
    hasValidPhoneNumber: input.hasValidPhoneNumber,
  })
}
