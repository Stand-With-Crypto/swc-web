import { Metadata } from 'next'

import { CNNDebateEventPage } from '@/components/app/pageEvents/CNNDebate'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'force-static'

const title = 'Presidential Debate watch parties'
const description =
  'Crypto advocates are hosting watch parties across the country to make sure our Presidential candidates stand with crypto.'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default function CNNDebatePage() {
  return <CNNDebateEventPage />
}
