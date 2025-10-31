import { email } from 'zod'

export const zodEmailAddress = email({
  error: 'Please enter a valid email address',
}).toLowerCase()
