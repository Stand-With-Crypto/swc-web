import { string, object } from 'zod'

// you don't want to use z. syntax in client-side components because it messes with tree shaking
export const zodEmailYourCongressperson = object({
  fullName: string().min(1, 'Please enter your full name').max(100, 'Please enter your full name'),
  zipCode: string().min(5, 'Please enter your zip code').max(5, 'Please enter your zip code'),
  email: string().email('Please enter a valid email address'),
  phoneNumber: string()
    .min(10, 'Please enter a valid phone number')
    .max(10, 'Please enter a valid phone number'),
  address: string().min(1, 'Please enter your address').max(300, 'Please enter your address'),
  message: string().min(1, 'Please enter a message').max(1000, 'Please enter a message'),
})
