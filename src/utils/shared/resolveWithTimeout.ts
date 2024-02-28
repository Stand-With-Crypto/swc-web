import { sleep } from '@/utils/shared/sleep'

const TIMEOUT_STATUS_CODE = 'timeout' as const
export async function resolveWithTimeout<
  TResult = unknown,
  TPromise extends Promise<TResult> = Promise<TResult>,
>(promise: TPromise, msTimeout = 1500) {
  const res = await Promise.any([sleep(msTimeout).then(() => TIMEOUT_STATUS_CODE), promise])
  if (res === TIMEOUT_STATUS_CODE) {
    throw new Error('Request timeout')
  }
  return res
}
