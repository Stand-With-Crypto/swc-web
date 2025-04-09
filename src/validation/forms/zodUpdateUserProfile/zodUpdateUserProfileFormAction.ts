import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodOptionalEmptyString } from '@/validation/utils'

import { getZodUpdateUserProfileBaseSchema, zodUpdateUserProfileBaseSuperRefine } from './base'

export const getZodUpdateUserProfileFormActionSchema = (countryCode: SupportedCountryCodes) =>
  getZodUpdateUserProfileBaseSchema(countryCode)
    .extend({
      firstName: zodOptionalEmptyString(zodFirstName),
      lastName: zodOptionalEmptyString(zodLastName),
      address: zodAddress.nullable(),
    })
    .superRefine(zodUpdateUserProfileBaseSuperRefine)
