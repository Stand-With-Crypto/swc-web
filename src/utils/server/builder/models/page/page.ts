import { PageModel, PageModelNames } from '@/utils/server/builder/models/page/PageModel'

class DefaultPageModel extends PageModel {
  public readonly pages = {
    // privacy: '/privacy',
  }

  isBuilderPage(pathname: string): boolean {
    return Object.values(this.pages).includes(pathname)
  }
}

export const pageModel = new DefaultPageModel(PageModelNames.PAGE)
