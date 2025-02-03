import { cache } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageBillDetails } from '@/components/app/pageBillDetails'
import { queryDTSIAllBillsSlugs } from '@/data/dtsi/queries/queryDTSIAllBillsSlugs'
import { queryDTSIBillDetails } from '@/data/dtsi/queries/queryDTSIBillDetails'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 60 // 1 minute
export const dynamic = 'error'
export const dynamicParams = true

type Props = PageProps<{ billSlug: string }>

export const getData = cache(async (billSlug: string) => {
  const bill = await queryDTSIBillDetails(billSlug).catch(() => null)
  return bill
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const bill = await getData((await props.params).billSlug)
  if (!bill) {
    return {}
  }
  return generateMetadataDetails({
    title: bill.shortTitle || bill.title,
    description:
      "Learn more about this bill, including whether it's pro crypto, see who sponsored/cosponsored it, and track votes.",
  })
}

export async function generateStaticParams() {
  const response = await queryDTSIAllBillsSlugs()
  const slugs = response.bills.map(({ id: billSlug }) => ({ billSlug }))
  return slugs
}

export default async function BillDetails(props: Props) {
  const params = await props.params
  const countryCode = params.countryCode

  const bill = await queryDTSIBillDetails(params.billSlug)

  if (!bill) {
    notFound()
  }

  return <PageBillDetails bill={bill} countryCode={countryCode} />
}
