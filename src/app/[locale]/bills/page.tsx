import { Metadata } from 'next'

import { PageBills } from '@/components/app/pageBills'
import { queryDTSIAllBills } from '@/data/dtsi/queries/queryDTSIAllBills'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 1200
export const dynamic = 'error'

const title = 'Crypto Bills'
const description =
  'Learn about the pending/passed bills and resolutions that affect the crypto industry.'
export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function BillsPage(props: PageProps) {
  const results = await queryDTSIAllBills()

  return (
    <PageBills
      bills={results}
      description={description}
      locale={props.params.locale}
      title={title}
    />
  )
}
