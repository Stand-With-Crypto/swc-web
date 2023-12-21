import { REPLACE_ME__captureException } from '@/utils/shared/captureException'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const gracefullyError = <Fallback>({
  msg,
  fallback,
}: {
  msg: string
  fallback: Fallback
}): never => {
  if (NEXT_PUBLIC_ENVIRONMENT === 'local') {
    throw new Error(msg)
  }
  REPLACE_ME__captureException(new Error(msg))
  return fallback as never
}
