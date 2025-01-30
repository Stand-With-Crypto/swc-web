import { Metadata } from 'next'

import { PageCreatorDefenseFund } from '@/components/app/pageCreatorDefenseFund'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

const title = 'Creator Legal Defense Fund'
const description =
  "Creativity and art have been linked together for centuries. Today, in a time when outdated regulations often stifle innovation and creativity, the crypto community has united to defend artists and creators against public policy failures and bad-faith attacks on those looking to build on blockchain technology. We are proud to announce the Creator Legal Defense Fund, an effort to protect artists and creators from legal threats, including the SEC's misguided regulation by enforcement agenda. This collaboration marks a significant milestone in our mission to empower and protect the voices of artists and creators who rely on blockchain technology."

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function CreatorDefenseFundPage() {
  return <PageCreatorDefenseFund description={description} title={title} />
}
