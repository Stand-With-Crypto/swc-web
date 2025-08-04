'use client'

import { useMemo } from 'react'
import { useToggle } from 'react-use'

export interface UseLimitItemsProps<T> {
  items: T[]
  initialLimit: number
}

export const useLimitItems = <T>({ items, initialLimit }: UseLimitItemsProps<T>) => {
  const [shouldLimit, toggleShouldLimit] = useToggle(true)

  const totalItems = items.length

  const hasMore = totalItems > initialLimit

  const newList = useMemo(() => {
    if (shouldLimit) {
      return items.slice(0, initialLimit)
    }
    return items
  }, [items, initialLimit, shouldLimit])

  const isShowingAll = totalItems === newList.length

  return {
    list: newList,
    hasMore,
    isShowingAll,
    shouldLimit,
    toggleShouldLimit,
    totalItems,
  }
}
