import { Metadata } from 'next'

import { PageDonate } from '@/components/app/pageDonate'
import { getSumDonations } from '@/data/aggregations/getSumDonations'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

const title = 'Donate'
const description =
  'Contributing to the Stand With Crypto Alliance will help shape policy & support policymakers who will champion clear, common-sense legislation that protects consumers and fosters innovation'

export const metadata: Metadata = {
  ...generateMetadataDetails({ title, description }),
}

export default async function DonatePage(props: PageProps) {
  const params = await props.params

  const { countryCode } = params

  const sumDonations = await getSumDonations()

  return (
    <PageDonate
      countryCode={countryCode}
      description={description}
      sumDonations={sumDonations}
      title="Protect the future of crypto"
    />
  )
}
