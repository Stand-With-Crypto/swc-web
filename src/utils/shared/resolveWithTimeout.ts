import { sleep } from '@/utils/shared/sleep'

const TIMEOUT_STATUS_CODE = 'timeout' as const
export async function resolveWithTimeout<
  TResult = unknown,
  TPromise extends Promise<TResult> = Promise<TResult>,
>(promise: TPromise, msTimeout = 100) {
  const res = await Promise.any([sleep(msTimeout).then(() => TIMEOUT_STATUS_CODE), promise])
  if (res === TIMEOUT_STATUS_CODE) {
    // todo throw once we clean up this flow
  }
  return res
}
