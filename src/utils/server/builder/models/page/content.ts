import { PageModelNames, PageModel } from '@/utils/server/builder/models/page/PageModel'

const PAGE_PREFIX = '/content/'

class ContentPageModel extends PageModel {
  isBuilderPage(pathname: string): boolean {
    return pathname.startsWith(this.routePrefix)
  }
}

export const contentPageModel = new ContentPageModel(PageModelNames.CONTENT, PAGE_PREFIX)
