import { builderSDKClient } from '@/utils/server/builder/builderSDKClient'
import { BuilderSectionModelIdentifiers } from '@/utils/server/builder/models/sections/constants'

export function getSectionContent(
  sectionModelName: BuilderSectionModelIdentifiers,
  pathname?: string,
) {
  return builderSDKClient
    .get(sectionModelName, {
      userAttributes: {
        urlPath: pathname,
      },
    })
    .toPromise()
}
