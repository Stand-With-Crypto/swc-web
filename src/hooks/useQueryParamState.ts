import { useCallback } from 'react'
import { isNil } from 'lodash-es'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useHasHydrated } from '@/hooks/useHasHydrated'

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
  // without this, if we immediately change UI based off query params, we'll get a hydration error
  const hasHydrated = useHasHydrated()
  const value = searchParams && hasHydrated ? searchParams.get(queryParamKey) : defaultValue
  const setValue = useCallback(
    (newValue: string | null) => {
      if (!searchParams || !pathname) {
        throw new Error('not possible state for useQueryParamState')
      }
      const params = new URLSearchParams(searchParams.toString())
      if (isNil(newValue)) {
        params.delete(queryParamKey)
      } else {
        params.set(queryParamKey, newValue)
      }

      return router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, searchParams, queryParamKey, router],
  )
  return { value, setValue: !searchParams || !pathname ? undefined : setValue }
}
