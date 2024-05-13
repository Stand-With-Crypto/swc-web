import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageBillDetails } from '@/components/app/pageBillDetails'
import { queryDTSIBillDetails } from '@/data/dtsi/queries/queryDTSIBillDetails'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.WEEK
export const dynamic = 'error'
export const dynamicParams = true

type Props = PageProps<{ billSlug: string }>

export async function generateMetadata(props: Props): Promise<Metadata> {
  // TODO: Fetch bill data
  const bill = {}
  if (!bill) {
    return {}
  }
  const title = ``
  return {
    title,
    description: ``,
  }
}

// TODO: generate pages
// export async function generateStaticParams() {
// }

export default async function BillDetails({ params }: Props) {
  const locale = params.locale

  const bill = await queryDTSIBillDetails(params.billSlug)

  if (!bill) {
    notFound()
  }

  return <PageBillDetails bill={bill} locale={locale} />
}
