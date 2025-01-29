import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderSectionModelIdentifiers } from '@/utils/server/builder/models/sections/constants'

export function getSectionContent(
  sectionModelName: BuilderSectionModelIdentifiers,
  pathname?: string,
) {
  const MyFetchOptions: RequestInit = {
    method: 'GET',
    cache: 'no-cache',
    keepalive: true,
  }

  return builderSDKClient
    .get(sectionModelName, {
      userAttributes: {
        urlPath: pathname,
      },
      prerender: false,
      cachebust: true,
      fetchOptions: MyFetchOptions,
    })
    .toPromise()
}
