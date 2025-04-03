'use client'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { cn } from '@/utils/web/cn'

export const UserActionFormReferSkeleton = ({ children }: { children?: React.ReactNode }) => {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container className="flex h-[400px] items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="relative flex min-h-32 min-w-32 items-center justify-center rounded-full bg-primary-cta/5">
            <div className="absolute inset-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border border-primary-cta/20"></div>
            <div className="absolute inset-1 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_200ms] rounded-full border border-primary-cta/30"></div>
            <div className="absolute inset-2 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_400ms] rounded-full border border-primary-cta/40"></div>

            <div className={cn('relative z-10', 'animate-[pulse_3s_ease-in-out_infinite]')}>
              {children}
            </div>
          </div>
          <p className="mt-6 font-medium text-primary/60">Please wait...</p>
        </div>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
