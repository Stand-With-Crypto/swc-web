import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { StateHeadsUp } from '@/components/app/pageStateHeadsUp'
import { PageProps } from '@/types'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'

import { getData } from './getData'

type StateHeadsUpPageProps = PageProps<{
  stateCode: string
}>

export async function generateMetadata({ params }: StateHeadsUpPageProps): Promise<Metadata> {
  const stateName = getUSStateNameFromStateCode(params.stateCode)

  const title = `See where ${stateName} politicians stand on crypto`
  const description = `We asked ${stateName} politicians for their thoughts on crypto. Here's what they said.`
  return {
    title,
    description,
  }
}

export async function generateStaticParams() {
  return [{ stateCode: 'ca' }]
}

export default async function StateHeadsUpPage({ params }: StateHeadsUpPageProps) {
  const { stateCode } = params

  const data = getData(stateCode)

  if (!data) {
    notFound()
  }

  return <StateHeadsUp stateCode={stateCode} statements={data} />
}
