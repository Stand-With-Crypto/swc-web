import _ from 'lodash'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export const useQueryParamState = ({
  queryParamKey,
  defaultValue,
}: {
  queryParamKey: string
  defaultValue: string | null
}): {
  value: string | null
  setValue?(newValue: string | null): void
} => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const value = searchParams ? searchParams.get(queryParamKey) : defaultValue
  const setValue = useCallback(
    (newValue: string | null) => {
      if (!searchParams || !pathname) {
        throw new Error('not possible state for useQueryParamState')
      }
      const params = new URLSearchParams(searchParams.toString())
      if (_.isNil(newValue)) {
        params.delete(queryParamKey)
      } else {
        params.set(queryParamKey, newValue)
      }

      return router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, searchParams, queryParamKey, router],
  )
  return { setValue: !searchParams || !pathname ? undefined : setValue, value }
}
