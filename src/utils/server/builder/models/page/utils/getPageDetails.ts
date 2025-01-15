import { PageModelIdentifiers } from '@/utils/server/builder/models/page/constants'
import { getPageContent } from '@/utils/server/builder/models/page/utils'

export interface PageMetadata {
  title: string
  description?: string
  hasFooter: boolean
  hasNavbar: boolean
}

export async function getPageDetails(
  pageModelName: PageModelIdentifiers,
  pathname: string,
): Promise<PageMetadata> {
  const content = await getPageContent(pageModelName, pathname)

  return {
    title: content?.data?.title,
    description: content?.data?.description,
    hasFooter: content?.data?.hasFooter ?? true,
    hasNavbar: content?.data?.hasNavbar ?? true,
  }
}
