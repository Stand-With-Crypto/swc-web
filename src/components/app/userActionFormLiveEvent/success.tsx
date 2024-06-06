'use client'

import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NextImage } from '@/components/ui/image'
import { NFTClientMetadata } from '@/utils/web/nft'

export const UserActionFormLiveEventSuccess = (props: NFTClientMetadata) => {
  const { image, name, description } = props

  return (
    <UserActionFormSuccessScreenFeedback
      Image={<NextImage src={image.url} {...image} />}
      description={description}
      title={name}
    />
  )
}
