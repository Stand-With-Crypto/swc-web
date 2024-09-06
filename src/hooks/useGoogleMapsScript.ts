import { useScript } from '@/hooks/useScript'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY',
)

/**
 * See https://stackoverflow.com/a/75212692 for why we set callback to `Function.prototype`
 */
function getGoogleMapsScriptSrc() {
  return `https://maps.googleapis.com/maps/api/js?key=${NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&loading=async&libraries=places&callback=Function.prototype`
}

export function useGoogleMapsScript() {
  return useScript(getGoogleMapsScriptSrc())
}
