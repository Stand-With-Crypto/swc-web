import { string } from 'zod'

export const zodDTSISlug = string({ required_error: 'Person required to submit' }).includes('---', {
  message: 'Must have a valid person selected',
})
