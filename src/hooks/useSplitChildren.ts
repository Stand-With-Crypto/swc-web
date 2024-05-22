'use client'

import { Children, ReactNode } from 'react'
import { useToggle } from 'react-use'

export interface UseSplitChildrenProps {
  children: ReactNode
  nItems: number
}

export const useSplitChildren = ({ children, nItems }: UseSplitChildrenProps) => {
  const [isRenderingAll, toggleRenderAll] = useToggle(false)

  const totalItems = Children.count(children)

  const visibleChildren = isRenderingAll ? children : Children.toArray(children).slice(0, nItems)

  const canRenderMore = totalItems > nItems && !isRenderingAll

  return { visibleChildren, canRenderMore, isRenderingAll, toggleRenderAll, totalItems }
}
