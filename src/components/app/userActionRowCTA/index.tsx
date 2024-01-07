'use client'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { Skeleton } from '@/components/ui/skeleton'
import { useDialog } from '@/hooks/useDialog'
import { SupportedLocale } from '@/intl/locales'
import { cn } from '@/utils/web/cn'
import { UserActionType } from '@prisma/client'
import { ChevronRight } from 'lucide-react'
import React, { ComponentType, Suspense } from 'react'
import { LazyExoticComponent } from 'react'

export interface UserActionRowCTAProps {
  actionType: UserActionType
  state: 'unknown' | 'complete' | 'incomplete'
  image: string
  text: string
  subtext: string
  canBeTriggeredMultipleTimes: boolean
  lazyRenderedForm: LazyExoticComponent<
    ComponentType<{ onCancel: () => void; onSuccess: () => void }>
  >
}

const UserActionRowCTAButton = React.forwardRef<
  React.ElementRef<'button'>,
  UserActionRowCTAProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(
  (
    {
      state,
      image,
      text,
      subtext,
      canBeTriggeredMultipleTimes,
      lazyRenderedForm,
      className,
      actionType,
      ...props
    },
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
              src={'misc/uncheckedCircle.svg'}
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

export function UserActionRowCTA(props: UserActionRowCTAProps) {
  const dialogProps = useDialog(false)
  return (
    <Dialog>
      <DialogTrigger asChild>
        <UserActionRowCTAButton {...props} />
      </DialogTrigger>
      <DialogContent className="max-w-3xl md:px-12 md:py-16">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <props.lazyRenderedForm
            onCancel={() => dialogProps.onOpenChange(false)}
            onSuccess={() => dialogProps.onOpenChange(false)}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
