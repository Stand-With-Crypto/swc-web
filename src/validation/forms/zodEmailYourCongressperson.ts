import { object, string } from 'zod'

import { zodFirstAndLastNames } from '@/validation/fields/zodName'

// you don't want to use z. syntax in client-side components because it messes with tree shaking
export const zodEmailYourCongressperson = object({
  zipCode: string().min(5, 'Please enter your zip code').max(5, 'Please enter your zip code'),
  email: string().email('Please enter a valid email address'),
  phoneNumber: string()
    .min(10, 'Please enter a valid phone number')
    .max(10, 'Please enter a valid phone number'),
  address: string().min(1, 'Please enter your address').max(300, 'Address too long'),
  message: string()
    .min(1, 'Please enter a message')
    .max(2000, 'Your message should not exceed 2000 characters'),
}).merge(zodFirstAndLastNames)
