'use client'

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { isNil } from 'lodash-es'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useHasHydrated } from '@/hooks/useHasHydrated'

type Value = string | undefined | null

export function useSearchParamState(
  queryParamKey: string,
  defaultValue?: Value,
): [Value, Dispatch<SetStateAction<Value>>] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const hasHydrated = useHasHydrated()

  const [internalState, setInternalState] = useState<Value>(() => {
    if (!searchParams) {
      return defaultValue
    }

    const searchParamValue = searchParams.get(queryParamKey)

    if (searchParamValue) {
      return decodeURIComponent(searchParamValue) as Value
    }

    return defaultValue
  })

  const setState: Dispatch<SetStateAction<Value>> = useCallback(
    newValue => {
      const valueToSet = typeof newValue === 'function' ? newValue(defaultValue) : newValue

      setInternalState(valueToSet)
    },
    [defaultValue],
  )

  useEffect(() => {
    if (!searchParams || !pathname || !hasHydrated) {
      return
    }

    const currentSearchParams = new URLSearchParams(searchParams?.toString() ?? '')

    if (isNil(internalState) || !internalState || internalState === defaultValue) {
      currentSearchParams.delete(queryParamKey)
    } else {
      currentSearchParams.set(queryParamKey, encodeURIComponent(internalState))
    }

    router.replace(`${pathname}?${currentSearchParams.toString()}`, { scroll: false })
  }, [defaultValue, hasHydrated, internalState, pathname, queryParamKey, router, searchParams])

  return [internalState, setState]
}
