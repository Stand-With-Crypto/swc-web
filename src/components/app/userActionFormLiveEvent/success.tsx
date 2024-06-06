'use client'

import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NextImage } from '@/components/ui/image'
import { NFTClientMetadata } from '@/utils/web/nft'

export const UserActionFormLiveEventSuccess = (props: NFTClientMetadata) => {
  const { image, name, description } = props

  return (
    <UserActionFormSuccessScreenFeedback
      description={description}
      image={<NextImage src={image.url} {...image} />}
      title={name}
    />
  )
}
