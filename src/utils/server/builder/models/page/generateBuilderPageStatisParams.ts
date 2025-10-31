import { PageProps } from '@/types'
import { BuilderPageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPagePaths } from '@/utils/server/builder/models/page/utils/getPagePaths'
import { toBool } from '@/utils/shared/toBool'

export function generateBuilderPageStaticParams(
  pageModelName: BuilderPageModelIdentifiers,
  pagePrefix: string,
) {
  return async function generateStaticParams(pageProps: PageProps) {
    if (toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)) {
      return []
    }

    const { countryCode } = await pageProps.params
    const paths = await getPagePaths({
      pageModelName,
      countryCode,
    })

    if (!paths || paths.length === 0) {
      return []
    }

    return paths.map(path => ({
      countryCode,
      page: path?.replace(pagePrefix, '').split('/'),
    }))
  }
}
