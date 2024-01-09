'use client'
import { NextImage } from '@/components/ui/image'
import { cn } from '@/utils/web/cn'
import { UserActionType } from '@prisma/client'
import { ChevronRight } from 'lucide-react'
import React from 'react'

export interface UserActionRowCTAProps {
  actionType: UserActionType
  state: 'unknown' | 'complete' | 'incomplete'
  image: string
  text: string
  subtext: string
  canBeTriggeredMultipleTimes: boolean
  DialogComponent: (args: { children: React.ReactNode }) => React.ReactNode
  onClick?: () => void
}

export const UserActionRowCTAButton = React.forwardRef<
  React.ElementRef<'button'>,
  Omit<UserActionRowCTAProps, 'DialogComponent'> & React.ButtonHTMLAttributes<HTMLButtonElement>
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
          return <div style={{ width: 20, height: 20 }} />
        case 'complete':
          return (
            <NextImage
              width={20}
              height={20}
              src={'/misc/checkedCircle.svg'}
              alt={'Action complete'}
            />
          )
        case 'incomplete':
          return (
            <NextImage
              width={20}
              height={20}
              src={'/misc/uncheckedCircle.svg'}
              alt={'Action not complete'}
            />
          )
      }
    }
    return (
      <button
        {...props}
        ref={ref}
        disabled={!canBeActionedOn}
        className={cn(
          'flex w-full items-center justify-between gap-4 rounded-xl bg-gray-100 p-4 text-left',
          className,
        )}
      >
        <div className="flex items-center gap-4">
          <div>{getStateUI()}</div>
          <div className="hidden md:block">
            {/* TODO alt */}
            <NextImage width={100} height={100} src={image} alt={text} />
          </div>
          <div>
            <div className="mb-1 text-xl font-bold">{text}</div>
            <div className="text-sm text-gray-500">{subtext}</div>
          </div>
        </div>
        {canBeActionedOn ? (
          <div>
            <ChevronRight />
          </div>
        ) : null}
      </button>
    )
  },
)
UserActionRowCTAButton.displayName = 'UserActionRowCTAButton'

export function UserActionRowCTA({ DialogComponent, ...props }: UserActionRowCTAProps) {
  return (
    <DialogComponent>
      <UserActionRowCTAButton {...props} />
    </DialogComponent>
  )
}
