import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PagePoliticianDetails } from '@/components/app/pagePoliticianDetails'
import { queryDTSIAllPeopleSlugs } from '@/data/dtsi/queries/queryDTSIAllPeopleSlugs'
import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { PageProps } from '@/types'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import {
  convertDTSIPersonStanceScoreToLetterGrade,
  DTSILetterGrade,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { getQuestionnaire } from '@/utils/server/builderIO/swc-questionnaire'
import { toBool } from '@/utils/shared/toBool'

import { getData } from './getData'

export const revalidate = 86400 // 1 day
export const dynamic = 'error'
export const dynamicParams = true

type Props = PageProps<{ dtsiSlug: string }>

const getDescription = (person: DTSIPersonDetails) => {
  const fullName = dtsiPersonFullName(person)
  if (!person.stances.length) {
    return `${fullName} has not made any recent comments about Bitcoin, Ethereum, and cryptocurrency innovation.`
  }
  const indication = (() => {
    switch (convertDTSIPersonStanceScoreToLetterGrade(person)) {
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
  const person = await getData((await props.params).dtsiSlug)
  if (!person) {
    return {}
  }
  const title = `${dtsiPersonFullName(person)} Crypto Policy Stance`
  return {
    title,
    description: getDescription(person),
  }
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

export default async function PoliticianDetails(props: Props) {
  const params = await props.params
  const { locale } = params

  const [person, questionnaire] = await Promise.all([
    getData(params.dtsiSlug),
    getQuestionnaire(params.dtsiSlug),
  ])

  if (!person) {
    notFound()
  }

  return <PagePoliticianDetails {...{ person, locale, questionnaire }} />
}
