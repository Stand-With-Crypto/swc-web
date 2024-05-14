'use client'

import { Button } from '@/components/ui/button'
import { useSplitChildren, UseSplitChildrenProps } from '@/hooks/useSplitChildren'

interface AvatarGridProps extends UseSplitChildrenProps {
  avatarSize: number
}

export const AvatarGrid = (props: AvatarGridProps) => {
  const { children, avatarSize, nItems } = props

  const { visibleChildren, canRenderMore, toggleRenderAll, totalItems } = useSplitChildren({
    children,
    nItems,
  })

  return (
    <>
      <div
        className={`mx-auto grid w-fit grid-flow-col grid-cols-[repeat(auto-fill,minmax(${avatarSize}px,1fr))] justify-items-center gap-4`}
      >
        {visibleChildren}
      </div>

      {canRenderMore ? (
        <Button onClick={toggleRenderAll} variant="secondary">
          View all ({totalItems})
        </Button>
      ) : null}
    </>
  )
}
