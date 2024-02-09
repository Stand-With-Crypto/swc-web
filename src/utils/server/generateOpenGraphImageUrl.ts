import { encodeObjectForUrl } from '@/utils/shared/encodeObjectForUrl'
import { fullUrl } from '@/utils/shared/urls'

export type OpenGraphImageOptions = { title: string; description?: string }
export const OPEN_GRAPH_IMAGE_DIMENSIONS = {
  height: 630,
  width: 1200,
}
export const getOpenGraphImageUrl = (props: OpenGraphImageOptions) => {
  return {
    url: fullUrl(`/api/public/og/${encodeObjectForUrl(props)}`),
    ...OPEN_GRAPH_IMAGE_DIMENSIONS,
  }
}
