import { string } from 'zod'

export const zodDTSISlug = string().includes('---', {
  message: 'Must have a valid person selected',
})
