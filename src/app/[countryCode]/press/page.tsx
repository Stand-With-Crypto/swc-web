import { Metadata } from 'next'

import { MOCK_PRESS_CONTENT } from '@/components/app/pagePress/mock'
import { PagePress } from '@/components/app/pagePress/press'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

const title = 'News'
const description = 'Stay informed on key crypto bills, news, and policy updates.'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function PressPage() {
  const pressContent = MOCK_PRESS_CONTENT.sort((a, b) => {
    return new Date(b.dateHeading).getTime() - new Date(a.dateHeading).getTime()
  })

  return <PagePress description={description} pressContent={pressContent} title={title} />
}
