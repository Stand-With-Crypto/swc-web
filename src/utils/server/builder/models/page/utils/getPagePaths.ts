import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'

interface GetPagePathsInput {
  modelName: BuilderPageModelIdentifiers
  limit?: number
}

export async function getPagePaths({ modelName, limit }: GetPagePathsInput): Promise<string[]> {
  return builderSDKClient
    .getAll(modelName, {
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
