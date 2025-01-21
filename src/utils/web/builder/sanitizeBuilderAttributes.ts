import { BuilderComponentAttributes } from '@/utils/web/builder/types'

export function sanitizeBuilderAttributes(attributes?: BuilderComponentAttributes) {
  delete attributes?.key

  return attributes
}
