import { object, string } from 'zod'

export const zodFirstName = string()
  .trim()
  .min(1, 'Please enter your first name')
  .max(100, 'First name too long')

export const zodLastName = string()
  .trim()
  .min(1, 'Please enter your last name')
  .max(100, 'Last name too long')

export const zodFirstAndLastNames = object({
  firstName: zodFirstName,
  lastName: zodLastName,
})
