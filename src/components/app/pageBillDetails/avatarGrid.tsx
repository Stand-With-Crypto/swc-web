'use client'

import { Children } from 'react'
import { AnimatePresence, motion } from 'motion/react'

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
        className={`grid w-full grid-flow-dense grid-cols-[repeat(auto-fit,minmax(126px,1fr))] justify-items-center gap-4 sm:grid-cols-[repeat(auto-fill,minmax(126px,1fr))] sm:justify-items-start`}
      >
        <AnimatePresence initial={false}>
          {Children.map(visibleChildren, (child, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0.33 }}
              key={index}
              transition={{ duration: 0.75 }}
            >
              {child}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {canRenderMore ? (
        <Button onClick={toggleRenderAll} variant="secondary">
          View all ({totalItems})
        </Button>
      ) : null}
    </>
  )
}
