import { UserActionOptInType } from '@prisma/client'
import { isAddress } from 'viem'
import { object, string, z } from 'zod'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodOptionalEmptyPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

const zodExternalUserActionOptInUserAddress = object({
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

export const getZodExternalUserActionOptInSchema = (countryCode: SupportedCountryCodes) =>
  z.object({
    emailAddress: zodEmailAddress,
    cryptoAddress: string()
      .optional()
      .refine(str => !str || isAddress(str), { message: 'Invalid Ethereum address' })
      .transform(str => str && str.toLowerCase()),
    optInType: z.nativeEnum(UserActionOptInType),
    campaignName: z.string(),
    isVerifiedEmailAddress: z.boolean(),
    firstName: zodFirstName.optional(),
    lastName: zodLastName.optional(),
    address: zodExternalUserActionOptInUserAddress.optional(),
    phoneNumber: zodOptionalEmptyPhoneNumber(countryCode).optional(),
    hasOptedInToReceiveSMSFromSWC: z.boolean().optional(),
    hasOptedInToEmails: z.boolean().optional(),
    hasOptedInToMembership: z.boolean().optional(),
    acquisitionOverride: z
      .object({
        source: z.string(),
        medium: z.string(),
      })
      .optional(),
    additionalAnalyticsProperties: z.record(z.string()).optional(),
    countryCode: zodSupportedCountryCode,
  })
