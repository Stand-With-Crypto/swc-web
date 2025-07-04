'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export interface MultipleSearchParamConfig {
  [key: string]: string | undefined | null
}

export function useMultipleSearchParamState(
  defaultValues: MultipleSearchParamConfig,
): [MultipleSearchParamConfig, (newValues: MultipleSearchParamConfig) => void] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname() || ''

  const currentSearchParamValues = useMemo(() => {
    const paramValues = { ...defaultValues }

    if (!searchParams) return paramValues

    for (const paramKey in paramValues) {
      const value = searchParams.get(paramKey)
      if (value) paramValues[paramKey] = value
    }

    return paramValues
  }, [defaultValues, searchParams])

  const updateSearchParams = useCallback(
    (newParamValues: MultipleSearchParamConfig) => {
      const currentSearchParams = new URLSearchParams(searchParams?.toString() ?? '')

      for (const paramKey in newParamValues) {
        const newValue = newParamValues[paramKey] as string
        const defaultValue = defaultValues[paramKey]

        if (!newValue || newValue === defaultValue) {
          currentSearchParams.delete(paramKey)
        } else {
          currentSearchParams.set(paramKey, encodeURIComponent(newValue))
        }
      }

      router.replace(`${pathname}?${currentSearchParams.toString()}`, { scroll: false })
    },
    [defaultValues, pathname, router, searchParams],
  )

  return [currentSearchParamValues, updateSearchParams]
}
