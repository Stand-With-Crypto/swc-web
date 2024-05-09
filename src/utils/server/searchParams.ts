import { PageProps } from '@/types'
import { UrlDestinationsWithoutParams } from '@/utils/shared/urls/types'

export function parseQueryString({
  queryParamKey,
  queryParamValue,
}: {
  queryParamKey: string
  queryParamValue: string | string[] | null
}) {
  if (!queryParamValue) return ''

  if (Array.isArray(queryParamValue)) {
    const queryString = queryParamValue.reduce((acc, value, index) => {
      if (index === 0) return `${acc}${queryParamKey}=${value}`
      return `${acc}&${queryParamKey}=${value}`
    }, '')
    return queryString.length ? `?${queryString}` : ''
  }

  return `?${queryParamKey}=${queryParamValue}`
}

export function getSearchParam({
  searchParams,
  queryParamKey,
}: {
  searchParams: PageProps['searchParams']
  queryParamKey: string
}) {
  if (!searchParams) return { value: null, queryString: '' }

  const params = new Map(Object.entries(searchParams))

  const value = params.get(queryParamKey) ?? null
  return { value }
}

export function setCallbackQueryString({
  destination,
}: {
  destination?: UrlDestinationsWithoutParams | null
}) {
  if (!destination) return ''
  return `?callback=${destination}`
}

export function parseCallbackQueryString({
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
