import { string } from 'zod'

import { PHONE_NUMBER_REGEX } from '@/utils/shared/phoneNumber'

export const zodPhoneNumber = string().regex(PHONE_NUMBER_REGEX, 'Please enter a valid phone number')
