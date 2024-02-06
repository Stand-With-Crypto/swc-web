import { string } from 'zod'

export const zodEmailAddress = string()
  .trim()
  .email('Please enter a valid email address')
  .toLowerCase()
