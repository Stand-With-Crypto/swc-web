import pRetry from 'p-retry'

import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderDataModelIdentifiers } from '@/utils/server/builder/models/data/constants'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

interface News {
  type: 'internal' | 'external'
}

interface InternalNews extends News {
  pressPage: {
    id: string
    model: BuilderPageModelIdentifiers
  }
}

interface ExternalNews extends News {
  title: string
  url: string
}

export async function getAllNews() {
  return await pRetry(
    () =>
      builderSDKClient.getAll(BuilderDataModelIdentifiers.NEWS, {
        query: {
          ...(NEXT_PUBLIC_ENVIRONMENT === 'production' && { published: 'published' }),
        },
        includeUnpublished: NEXT_PUBLIC_ENVIRONMENT !== 'production',
        cacheSeconds: 60,
        //   limit: LIMIT,
        fields: 'data,createdDate',
        //   offset,
      }) as Promise<
        Array<{
          createdDate: number
          data: InternalNews | ExternalNews
        }>
      >,
    {
      retries: 3,
      minTimeout: 10000,
    },
  )
}
