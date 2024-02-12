import { differenceInDays, isAfter } from 'date-fns'
import fs from 'fs-extra'
import path from 'path'

import { getLogger } from '@/utils/shared/logger'

interface LocalCacheData<T> {
  datetimeCreated: string
  data: T
}

const logger = getLogger('fetchWithLocalCache')

/*
This is a utility function that allows you to cache parts of a bin script that you'd like to quickly iterate on without 
continuously refetching every time you run the script. This function should not be used outside of a bin context as it writes to your local file system
*/
export async function fetchWithLocalCache<T>({
  fileName,
  fetchFn,
  datetimeExpires,
}: {
  fileName: string
  fetchFn: () => Promise<T>
  datetimeExpires: Date
}) {
  const cacheFilePath = path.join(__dirname, '../localCache', fileName)
  if (await fs.exists(cacheFilePath)) {
    logger.info(`file exists at cacheFilePath: ${cacheFilePath}`)
    const cacheFile: LocalCacheData<T> = await fs.readJSON(cacheFilePath)
    if (!isAfter(new Date(cacheFile.datetimeCreated), datetimeExpires)) {
      return cacheFile.data as T
    } else {
      logger.info(
        `content expired ${differenceInDays(
          new Date(cacheFile.datetimeCreated),
          datetimeExpires,
        )} days ago`,
      )
    }
  } else {
    logger.info(`file does not exist at cacheFilePath: ${cacheFilePath}`)
  }
  const result = await fetchFn()
  await fs.outputFile(
    cacheFilePath,
    JSON.stringify(
      {
        datetimeCreated: new Date().toISOString(),
        data: result,
      },
      null,
      4,
    ),
  )
  return result
}
