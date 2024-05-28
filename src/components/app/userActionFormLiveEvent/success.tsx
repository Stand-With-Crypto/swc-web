'use client'

import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NextImage } from '@/components/ui/image'
import { NFTClientMetadata } from '@/utils/web/nft'

interface UserActionFormLiveEventSuccessProps extends NFTClientMetadata {}

export const UserActionFormLiveEventSuccess = (props: UserActionFormLiveEventSuccessProps) => {
  const { image, name, description } = props

  return (
    <UserActionFormSuccessScreenFeedback
      Image={<NextImage src={image.url || '/logo/shield.svg'} {...image} />}
      description={description}
      title={name}
    />
  )
}
