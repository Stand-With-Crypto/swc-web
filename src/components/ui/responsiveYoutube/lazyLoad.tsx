import { lazy } from 'react'

export const LazyResponsiveYoutube = lazy(() =>
  import('@/components/ui/responsiveYoutube').then(m => ({
    default: m.ResponsiveYoutube,
  })),
)
