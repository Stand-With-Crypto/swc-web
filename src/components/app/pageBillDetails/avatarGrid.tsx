'use client'

import { Button } from '@/components/ui/button'
import { useSplitChildren, UseSplitChildrenProps } from '@/hooks/useSplitChildren'

interface AvatarGridProps extends UseSplitChildrenProps {}

export const AvatarGrid = (props: AvatarGridProps) => {
  const { children, nItems } = props

  const { visibleChildren, canRenderMore, toggleRenderAll, totalItems } = useSplitChildren({
    children,
    nItems,
  })

  return (
    <>
      <div
        className={`mx-auto grid w-full grid-flow-dense grid-cols-[repeat(auto-fit,minmax(126px,1fr))] justify-items-center gap-4`}
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
