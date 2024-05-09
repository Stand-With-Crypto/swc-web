import { PageProps } from '@/types'

export const parseQueryString = ({
  queryParamKey,
  queryParamValue,
}: {
  queryParamKey: string
  queryParamValue: string | string[] | null
}) => {
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

export const getSearchParam = ({
  searchParams,
  queryParamKey,
}: {
  searchParams: PageProps['searchParams']
  queryParamKey: string
}) => {
  if (!searchParams) return { value: null, queryString: '' }

  const params = new Map(Object.entries(searchParams))

  const value = params.get(queryParamKey) ?? null
  return { value, queryString: parseQueryString({ queryParamKey, queryParamValue: value }) }
}
