import { cache } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageBillDetails } from '@/components/app/pageBillDetails'
import { queryDTSIAllBillsSlugs } from '@/data/dtsi/queries/queryDTSIAllBillsSlugs'
import { queryDTSIBillDetails } from '@/data/dtsi/queries/queryDTSIBillDetails'
import { PageProps } from '@/types'

export const revalidate = 1200
export const dynamic = 'error'
export const dynamicParams = false

type Props = PageProps<{ billSlug: string }>

export const getData = cache(async (billSlug: string) => {
  const bill = await queryDTSIBillDetails(billSlug).catch(() => null)
  return bill
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const bill = await getData(props.params.billSlug)
  if (!bill) {
    return {}
  }
  return {
    title: bill.shortTitle || bill.title,
    description: bill.summary || bill.title,
  }
}

export async function generateStaticParams() {
  const response = await queryDTSIAllBillsSlugs()
  const slugs = response.bills.map(({ id: billSlug }) => ({ billSlug }))
  return slugs
}

export default async function BillDetails({ params }: Props) {
  const locale = params.locale

  const bill = await queryDTSIBillDetails(params.billSlug)

  if (!bill) {
    notFound()
  }

  return <PageBillDetails bill={bill} locale={locale} />
}
