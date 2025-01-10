import { allPageModels } from '@/utils/server/builder/models/page'

export function isBuilderPage(pathname: string | null) {
  if (!pathname) {
    return false
  }

  for (const pageModel of allPageModels) {
    if (pageModel.isBuilderPage(pathname)) {
      return true
    }
  }

  return false
}
