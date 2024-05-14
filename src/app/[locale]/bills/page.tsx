import { Metadata } from 'next'

import { PageBills } from '@/components/app/pageBills'
import { queryDTSIAllBills } from '@/data/dtsi/queries/queryDTSIAllBills'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.DAY
export const dynamic = 'error'

const title = '[PH] Bills'
const description =
  '[PH] Learn about the pending bills and resolutions that affect the crypto industry.'
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
