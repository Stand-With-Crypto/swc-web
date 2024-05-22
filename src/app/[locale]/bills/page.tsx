import { Metadata } from 'next'

import { PageBills } from '@/components/app/pageBills'
import { queryDTSIAllBills } from '@/data/dtsi/queries/queryDTSIAllBills'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 60
export const dynamic = 'error'

const title = 'Crypto Bills'
const description =
  "As Congress votes on legislation that would affect crypto and other digital assets, we'll keep an eye out for you. Check this page for information about key bills moving through the House and the Senate as well as analysis on whether they're pro-crypto or anti-crypto."
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
