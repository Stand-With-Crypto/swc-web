import { requiredEnv } from '@/utils/shared/requiredEnv'
import { useJsApiLoader, Libraries } from '@react-google-maps/api'

const NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY',
)
const GOOGLE_API_LIBRARIES: Libraries = ['places']

export function useGoogleMapsScript() {
  if (!NEXT_PUBLIC_GOOGLE_PLACES_API_KEY) {
    return {
      isLoaded: false,
      loadError: new Error('NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is not defined'),
    }
  }

  return useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    libraries: GOOGLE_API_LIBRARIES,
  })
}
