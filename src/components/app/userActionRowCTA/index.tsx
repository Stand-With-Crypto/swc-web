'use client'
import React from 'react'
import { ChevronRight } from 'lucide-react'

import { NextImage } from '@/components/ui/image'
import { Skeleton } from '@/components/ui/skeleton'
import { ActiveClientUserActionType } from '@/utils/shared/activeUserAction'
import { cn } from '@/utils/web/cn'

export interface UserActionRowCTAProps {
  actionType: ActiveClientUserActionType
  state: 'unknown' | 'complete' | 'incomplete' | 'hidden'
  image: string
  text: string
  subtext: string
  canBeTriggeredMultipleTimes: boolean
  WrapperComponent: (args: { children: React.ReactNode }) => React.ReactNode
  onClick?: () => void
}

export const UserActionRowCTAButton = React.forwardRef<
  React.ElementRef<'button'>,
  Omit<UserActionRowCTAProps, 'WrapperComponent'> & React.ButtonHTMLAttributes<HTMLButtonElement>
>(
  (
    { state, image, text, subtext, canBeTriggeredMultipleTimes, className, actionType, ...props },
    ref,
  ) => {
    const canBeActionedOn =
      canBeTriggeredMultipleTimes || (!canBeTriggeredMultipleTimes && state !== 'complete')
    const getStateUI = () => {
      switch (state) {
        case 'unknown':
          // we add a div to take up this space so if the answer to complete/incomplete is unknown, the UI doesn't jump once we fetch that data
          return <div style={{ width: 24, height: 24 }} />
        case 'complete':
          return (
            <NextImage
              alt={'Action complete'}
              height={24}
              src={'/misc/checkedCircle.svg'}
              width={24}
            />
          )
        case 'incomplete':
          return (
            <NextImage
              alt={'Action not complete'}
              height={24}
              src={'/misc/uncheckedCircle.svg'}
              width={24}
            />
          )
      }
    }
    return (
      <button
        {...props}
        className={cn(
          'flex w-full items-center justify-between gap-4 rounded-3xl bg-secondary p-4 text-left transition hover:drop-shadow-lg lg:p-8',
          className,
        )}
        data-test-id={`user-action-cta-${actionType}`}
        disabled={!canBeActionedOn}
        ref={ref}
      >
        <div className="flex items-center gap-4">
          {state !== 'hidden' && <div className="flex-shrink-0">{getStateUI()}</div>}
          <div className="hidden flex-shrink-0 md:block">
            <NextImage
              alt={text}
              className="rounded-xl"
              height={100}
              src={image}
              style={{ height: 100, width: 100, objectFit: 'cover' }}
              width={100}
            />
          </div>
          <div>
            <div className="mb-1 text-base font-bold lg:text-2xl">{text}</div>
            <div className="text-sm text-gray-500 lg:text-xl">{subtext}</div>
          </div>
        </div>
        {canBeActionedOn ? (
          <div>
            <ChevronRight className="h-6 w-6 lg:h-8 lg:w-8" />
          </div>
        ) : null}
      </button>
    )
  },
)
UserActionRowCTAButton.displayName = 'UserActionRowCTAButton'

export function UserActionRowCTAButtonSkeleton() {
  return <Skeleton className="h-40 w-full" />
}

export function UserActionRowCTA({ WrapperComponent, ...props }: UserActionRowCTAProps) {
  return (
    <WrapperComponent>
      <UserActionRowCTAButton {...props} />
    </WrapperComponent>
  )
}
