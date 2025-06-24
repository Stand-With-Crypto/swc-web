import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface GetPagePathsInput {
  pageModelName: BuilderPageModelIdentifiers
  countryCode?: SupportedCountryCodes
}

/** Retrieves a list of all existing routes under a specific page model  */
export async function getPagePaths({
  pageModelName,
  countryCode,
}: GetPagePathsInput): Promise<string[]> {
  return builderSDKClient
    .getAll(pageModelName, {
      query: {
        data: {
          countryCode: countryCode?.toUpperCase(),
        },
      },
      options: {
        noTargeting: true,
      },
      sort: {
        createdDate: -1,
      },
      fields: 'data,createdDate',
      cachebust: true,
    })
    .then(res => res?.map(({ data }) => data?.url) ?? [])
}
