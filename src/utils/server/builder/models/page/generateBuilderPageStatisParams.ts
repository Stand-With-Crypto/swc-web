import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPagePaths } from '@/utils/server/builder/models/page/utils/getPagePaths'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function generateBuilderPageStaticParams(
  pageModelName: BuilderPageModelIdentifiers,
  pagePrefix: string,
) {
  return async function generateStaticParams() {
    const pathsByCountryCode = await Promise.all(
      ORDERED_SUPPORTED_COUNTRIES.map(async countryCode => ({
        countryCode,
        paths: await getPagePaths({
          pageModelName,
          countryCode,
        }),
      })),
    )

    return pathsByCountryCode.flatMap(({ countryCode, paths }) => {
      return paths.map(path => {
        return {
          params: {
            countryCode,
            page: path?.replace(pagePrefix, '').split('/'),
          },
        }
      })
    })
  }
}
