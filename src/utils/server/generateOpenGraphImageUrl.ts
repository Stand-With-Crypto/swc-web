import { EncodedObject, encodeObjectForUrl } from '@/utils/shared/encodeObjectForUrl'
import { fullUrl } from '@/utils/shared/urls'

export interface OpenGraphImageOptions extends EncodedObject {
  title: string
  description?: string
}
export const OPEN_GRAPH_IMAGE_DIMENSIONS = {
  width: 1200,
  height: 630,
}
export const getOpenGraphImageUrl = (props: OpenGraphImageOptions) => {
  return {
    url: fullUrl(`/api/public/og/${encodeObjectForUrl(props)}`),
    ...OPEN_GRAPH_IMAGE_DIMENSIONS,
  }
}
