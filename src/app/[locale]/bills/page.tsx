import { Metadata } from 'next'

import { PageBills } from '@/components/app/pageBills'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

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

type Props = PageProps

export default async function BillsPage(props: Props) {
  return <PageBills description={description} title={title} />
}
