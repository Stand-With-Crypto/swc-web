import { string } from 'zod'

export const zodDTSISlug = string({
  error: issue => (issue.input === undefined ? 'Person required to submit' : 'Invalid person slug'),
})
