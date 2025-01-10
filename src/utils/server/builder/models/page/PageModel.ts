import { serverCMS } from '@/utils/server/builder/serverCMS'
import type { Content } from '@builder.io/react'

export enum PageModelNames {
  PAGE = 'page',
  CONTENT = 'content',
}

export interface PageMetadata {
  title: string
  description?: string
  hasNavbar?: boolean
  hasFooter?: boolean
}

export abstract class PageModel {
  modelName: PageModelNames
  routePrefix: string

  constructor(modelName: PageModelNames, routePrefix?: string) {
    this.modelName = modelName
    this.routePrefix = routePrefix ?? ''
  }

  private addPrefix(pathname?: string) {
    return `${this.routePrefix ?? ''}${pathname}`
  }

  public async getPageContent(pathname?: string): Promise<Content | undefined> {
    return serverCMS
      .get(this.modelName, {
        userAttributes: {
          urlPath: this.addPrefix(pathname),
        },
        // Set prerender to false to return JSON instead of HTML
        prerender: false,
      })
      .toPromise()
  }

  public async getPageMetadata(pathname: string): Promise<PageMetadata> {
    const content = await this.getPageContent(pathname)

    return {
      title: content?.data.title,
      description: content?.data.description,
      hasNavbar: content?.data.hasNavbar,
      hasFooter: content?.data.hasFooter,
    }
  }

  // Each page model has its own logic to determine if a page is a builder page
  abstract isBuilderPage(pathname: string): boolean
}
