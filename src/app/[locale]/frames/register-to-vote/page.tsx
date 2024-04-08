import { getFrameMetadata } from '@coinbase/onchainkit/frame'
import { Metadata } from 'next'

import { PageVote } from '@/components/app/pageVote'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { fullUrl } from '@/utils/shared/urls'

export const dynamic = 'error'

const title = 'Stand With Crypto'
const description = 'Register to vote and get a free NFT'

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Next →',
    },
  ],
  image: {
    src: fullUrl('/api/public/frames/register-to-vote/image/0'),
  },
  postUrl: fullUrl('/api/public/frames/register-to-vote?frame=0'),
  state: {
    emailAddress: '',
    phoneNumber: '',
  },
})

export const metadata: Metadata = {
  ...generateMetadataDetails({
    description,
    title,
  }),
  other: {
    ...frameMetadata,
  },
}

export default async function VotePage({ params }: PageProps) {
  return <PageVote params={params} />
}
