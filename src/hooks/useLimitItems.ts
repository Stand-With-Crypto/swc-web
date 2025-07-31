'use client'

import { useEffect, useMemo } from 'react'
import { useToggle } from 'react-use'

export interface UseLimitItemsProps<T> {
  items: T[]
  nItems: number
}

export const useLimitItems = <T>({ items, nItems }: UseLimitItemsProps<T>) => {
  const [shouldLimit, toggleShouldLimit] = useToggle(true)

  const totalItems = items.length

  const canReturnMore = totalItems > nItems

  const newList = useMemo(() => {
    if (shouldLimit) {
      return items.slice(0, nItems)
    }
    return items
  }, [items, nItems, shouldLimit])

  const isReturnMore = totalItems > newList.length

  useEffect(() => {
    if (canReturnMore) {
      toggleShouldLimit(true)
    }
  }, [totalItems, canReturnMore, toggleShouldLimit])

  return {
    list: newList,
    canReturnMore,
    isReturnMore,
    shouldLimit,
    toggleShouldLimit,
    totalItems,
  }
}
