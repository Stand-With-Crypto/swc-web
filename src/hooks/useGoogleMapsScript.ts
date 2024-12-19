import { Libraries, useJsApiLoader } from '@react-google-maps/api'

import { requiredEnv } from '@/utils/shared/requiredEnv'

const NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY',
)
const GOOGLE_API_LIBRARIES: Libraries = ['places']

export function useGoogleMapsScript() {
  return useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    libraries: GOOGLE_API_LIBRARIES,
  })
}
