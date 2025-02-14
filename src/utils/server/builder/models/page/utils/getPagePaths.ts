import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'

interface GetPagePathsInput {
  pageModelName: BuilderPageModelIdentifiers
  limit?: number
}

/** Retrieves a list of all existing routes under a specific page model  */
export async function getPagePaths({ pageModelName, limit }: GetPagePathsInput): Promise<string[]> {
  return builderSDKClient
    .getAll(pageModelName, {
      options: {
        noTargeting: true,
      },
      limit,
      sort: {
        createdDate: -1,
      },
      fields: 'data,createdDate',
      cachebust: true,
    })
    .then(res => res?.map(({ data }) => data?.url) ?? [])
}
