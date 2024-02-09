import _ from 'lodash'

import { logger } from '@/utils/shared/logger'

export const batchAsyncAndLog = async <T, A extends (items: T[]) => Promise<any>>(
  items: T[],
  action: A,
  { chunkSize }: { chunkSize?: number } = {},
) => {
  const batches = _.chunk(items, chunkSize || 100)
  const total = batches.reduce((acc, batch) => acc + batch.length, 0)
  let count = 0
  const results: Awaited<ReturnType<A>>[] = []
  for (const batch of batches) {
    results.push(await action(batch))
    count += batch.length
    logger.info(`${count} of ${total} created (${Math.round((count / total) * 100)}%)`)
  }
  return results
}
