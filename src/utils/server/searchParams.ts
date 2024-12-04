import { PageProps } from '@/types'
import { UrlDestinationsWithoutParams } from '@/utils/shared/urls/types'

export function getSearchParam({
  searchParams,
  queryParamKey,
}: {
  searchParams: Awaited<PageProps['searchParams']>
  queryParamKey: string
}) {
  if (!searchParams) return { value: null, queryString: '' }

  const params = new Map(Object.entries(searchParams))

  const value = params.get(queryParamKey) ?? null
  return { value }
}

// The callbacks are restricted to url destinations that dont need custom parameters because their
// functions require args that are not consistent with one another and I could not find a good
// way to parse these function args from the queryString and call the url function conditionally
// with the correct args in a way that typescript would be happy with.

export function setCallbackQueryString({
  destination,
}: {
  destination?: UrlDestinationsWithoutParams | null
}) {
  if (!destination) return ''
  return `?callback=${destination}`
}

export function getCallbackDestination({
  queryString,
  defaultDestination,
}: {
  queryString?: string
  defaultDestination: UrlDestinationsWithoutParams
}) {
  if (!queryString) {
    return {
      destination: defaultDestination,
    }
  }

  const queryParams = new URLSearchParams(queryString)
  const callbackDestination = queryParams.get('callback')
  if (!callbackDestination) {
    return {
      destination: defaultDestination,
    }
  }

  return {
    destination: callbackDestination as UrlDestinationsWithoutParams,
  }
}
