'use client'

import { UserActionFormReferSkeleton } from '@/components/app/userActionFormRefer/common/skeleton'
import { NextImage } from '@/components/ui/image'

export const AUUserActionFormReferSkeleton = () => {
  return (
    <UserActionFormReferSkeleton>
      <NextImage
        alt="Refer a friend"
        className="object-contain drop-shadow-md"
        height={100}
        src="/au/actionTypeIcons/refer.png"
        width={100}
      />
    </UserActionFormReferSkeleton>
  )
}
