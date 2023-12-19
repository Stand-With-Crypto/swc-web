import { REPLACE_ME__captureException } from '@/utils/shared/captureException'

export function requiredEnv(value: string | undefined, name: string) {
  if (!value) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const error = new Error(`Required environment variable ${name} is missing. Value was ${value}`)
    // can't import NEXT_PUBLIC_ENVIRONMENT because it would be a circular dependency
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'local') {
      throw error
    }
    REPLACE_ME__captureException(error)
  }
  return value!
}
