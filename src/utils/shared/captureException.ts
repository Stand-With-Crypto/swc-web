// TODO this a placeholder function that should eventually be replace by the error logging software the team ends up using
// my proposed solution is https://sentry.io/welcome/ but we need IT risk sign off for things like this

import { logger } from '@/utils/shared/logger'

export const REPLACE_ME__captureException = (error: Error) => {
  logger.error(error)
}
