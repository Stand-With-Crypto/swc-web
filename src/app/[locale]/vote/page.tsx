import { Metadata } from 'next'

import { PageVote } from '@/components/app/pageVote'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { getFrameMetadata } from '@coinbase/onchainkit/frame'
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
    src: fullUrl('/api/public/frame/image/0'),
  },
  postUrl: fullUrl('/api/public/frame?frame=0'),
});

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