import { Metadata } from 'next'
import { getSumDonations } from '@/data/aggregations/getSumDonations'
import { DonatePageContent } from '@/components/app/pageDonate'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

const title = 'Protect the future of crypto'
const description =
  'Contributing to the Stand With Crypto Alliance will help shape policy & support policymakers who will champion clear, common-sense legislation that protects consumers and fosters innovation'

export const metadata: Metadata = {
  ...generateMetadataDetails({ title, description }),
}

export default async function DonatePage({ params: { locale } }: PageProps) {
  const sumDonations = await getSumDonations()

  return (
    <DonatePageContent
      title={title}
      description={description}
      sumDonations={sumDonations}
      locale={locale}
    />
  )
}
