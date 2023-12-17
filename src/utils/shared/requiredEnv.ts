import { REPLACE_ME__captureException } from '@/utils/shared/captureException'
import { logger } from '@/utils/shared/logger'

export function requiredEnv(value: string | undefined, name: string) {
  if (!value) {
    REPLACE_ME__captureException(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      new Error(`Required environment variable ${name} is missing. Value was ${value}`),
    )
  }
  return value!
}
