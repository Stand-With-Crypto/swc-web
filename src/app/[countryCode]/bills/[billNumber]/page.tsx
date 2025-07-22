import { cache } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageBillDetails } from '@/components/app/pageBillDetails'
import { getAllBillNumbers } from '@/data/bills/getAllBillNumbers'
import { getBill } from '@/data/bills/getBill'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'
export const dynamicParams = true

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

type Props = PageProps<{ billNumber: string }>

export const getData = cache(async (billNumber: string) => {
  const bill = await getBill(billNumber).catch(() => null)
  return bill
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const bill = await getData((await props.params).billNumber)

  if (!bill) {
    return {}
  }

  return generateMetadataDetails({
    title: bill.title,
    description:
      "Learn more about this bill, including whether it's pro crypto, see who sponsored/cosponsored it, and track votes.",
  })
}

export async function generateStaticParams() {
  const response = await getAllBillNumbers(countryCode)
  const numbers = response.map(billNumber => ({ billNumber }))
  return numbers
}

export default async function BillDetails(props: Props) {
  const params = await props.params

  const bill = await getBill(params.billNumber)

  if (!bill) {
    notFound()
  }

  return <PageBillDetails bill={bill} countryCode={countryCode} />
}
