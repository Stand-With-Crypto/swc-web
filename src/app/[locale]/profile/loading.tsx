import { PageUserProfileSkeleton } from '@/components/app/pageUserProfile/skeleton'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { Metadata } from 'next'

export const dynamic = 'error'

type Props = PageProps

const title = 'Your Stand With Crypto profile'
const description = `See what actions you can take to help promote innovation.`
export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title,
    description,
  })
}

export default function Profile() {
  return <PageUserProfileSkeleton />
}
