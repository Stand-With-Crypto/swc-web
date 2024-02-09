import { cache } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PagePoliticianDetails } from '@/components/app/pagePoliticianDetails'
import { queryDTSIAllPeopleSlugs } from '@/data/dtsi/queries/queryDTSIAllPeopleSlugs'
import {
  DTSIPersonDetails,
  queryDTSIPersonDetails,
} from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { PageProps } from '@/types'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIStanceScoreToLetterGrade,
  DTSILetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { toBool } from '@/utils/shared/toBool'

export const revalidate = 60 * 24 * 7
export const dynamic = 'error'
export const dynamicParams = true

type Props = PageProps<{ dtsiSlug: string }>

const getData = cache(async (dtsiSlug: string) => {
  const person = await queryDTSIPersonDetails(dtsiSlug).catch(() => null)
  return person
})

const getDescription = (person: DTSIPersonDetails) => {
  const fullName = dtsiPersonFullName(person)
  if (!person.stances.length) {
    return `${fullName} has not made any recent comments about Bitcoin, Ethereum, and cryptocurrency innovation.`
  }
  const indication = (() => {
    switch (convertDTSIStanceScoreToLetterGrade(person)) {
      case DTSILetterGrade.A:
        return 'indicated they are very pro-cryptocurrencies'
      case DTSILetterGrade.B:
        return 'indicated thy are somewhat pro-cryptocurrencies'
      case DTSILetterGrade.C:
      case null:
        return 'not indicated whether they are for or against cryptocurrencies.'
      case DTSILetterGrade.D:
        return 'indicated they are somewhat anti-cryptocurrencies'
      case DTSILetterGrade.F:
        return 'indicated they are very anti-cryptocurrencies'
    }
  })()
  return `Based on previous comments, ${fullName} has ${indication}. On this page you can view the tweets, quotes, and other commentary ${fullName} has made about Bitcoin, Ethereum, and cryptocurrency innovation.`
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const person = await getData(props.params.dtsiSlug)
  if (!person) {
    return {}
  }
  const title = `${dtsiPersonFullName(person)} Crypto Policy Stance`
  return generateMetadataDetails({
    title,
    description: getDescription(person),
  })
}
export async function generateStaticParams() {
  const slugs = await queryDTSIAllPeopleSlugs().then(x =>
    x.people.map(({ slug: dtsiSlug }) => ({ dtsiSlug })),
  )
  if (toBool(process.env.MINIMIZE_PAGE_PRE_GENERATION)) {
    return slugs.slice(0, 2)
  }
  return slugs
}

export default async function PoliticianDetails({ params }: Props) {
  const { locale } = params
  const person = await getData(params.dtsiSlug)
  if (!person) {
    notFound()
  }
  return <PagePoliticianDetails {...{ person, locale }} />
}
