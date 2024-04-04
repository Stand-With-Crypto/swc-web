import { useScript } from '@/hooks/useScript'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY',
)

/**
 * See https://stackoverflow.com/a/75212692 for why we default de callback to `Function.prototype`
 */
export function getGoogleMapsScriptSrc(callbackFnName = 'Function.prototype') {
  return `https://maps.googleapis.com/maps/api/js?key=${NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&callback=${callbackFnName}`
}

export function useGoogleMapsScript(callbackFnName?: string) {
  return useScript(getGoogleMapsScriptSrc(callbackFnName))
}
