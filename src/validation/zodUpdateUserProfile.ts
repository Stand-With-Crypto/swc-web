import { zodOptionalEmptyString } from '@/validation/utils'
import { string, object, union, any } from 'zod'

// you don't want to use z. syntax in client-side components because it messes with tree shaking
export const zodUpdateUserProfile = object({
  fullName: zodOptionalEmptyString(
    string().min(1, 'Please enter your full name').max(100, 'Please enter your full name'),
  ),
  email: zodOptionalEmptyString(string().email('Please enter a valid email address')),
  phoneNumber: zodOptionalEmptyString(
    string()
      .min(10, 'Please enter a valid phone number')
      .max(10, 'Please enter a valid phone number'),
  ),
  // TODO - replace with google places structure
  address: any(),
})
